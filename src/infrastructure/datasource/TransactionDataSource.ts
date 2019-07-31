import { AccountHttp, TransactionHttp, BlockHttp, Account, Address,
  TransferTransaction, Deadline, Mosaic, MosaicId, NetworkCurrencyMosaic, PlainMessage,
  PublicAccount, QueryParams, TransactionInfo, Order, UInt64, MosaicHttp, MosaicInfo, NamespaceHttp, NamespaceId } from 'nem2-sdk'
import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { of, zip } from 'rxjs'
import { mergeMap, map, combineAll, filter, zipAll, catchError } from 'rxjs/operators'
import { ListenerWrapper } from '@/infrastructure/wrapper/ListenerWrapper'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionHistoryInfo } from '@/domain/entity/TransactionHistoryInfo'
import { NemNode } from '@/domain/configure/NemNode'
import { NemHelper } from '@/domain/helper/NemHelper'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { SendAsset } from '@/domain/entity/SendAsset'
import { empty } from 'rxjs';

export class TransactionDataSource implements TransactionRepository {
  nemNode: NemNode
  listenerWrapper: ListenerWrapper
  private accountHttp: AccountHttp
  private transactionHttp: TransactionHttp
  private blockHttp: BlockHttp
  private mosaicHttp: MosaicHttp
  private namespaceHttp: NamespaceHttp

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    this.accountHttp = new AccountHttp(nemNode.endpoint)
    this.transactionHttp = new TransactionHttp(nemNode.endpoint)
    this.blockHttp = new BlockHttp(nemNode.endpoint)
    this.listenerWrapper = new ListenerWrapper(nemNode.wsEndpoint)
    this.mosaicHttp = new MosaicHttp(nemNode.endpoint)
    this.namespaceHttp = new NamespaceHttp(nemNode.endpoint)
  }

  async sendAsset(privateKey: string, asset: SendAsset): Promise<TransactionResult> {
    const recipientAddress = Address.createFromRawAddress(asset.address)
    console.log(asset.getRawAmount())
    const transferTransaction = TransferTransaction.create(
        Deadline.create(),
        recipientAddress,
        [new Mosaic(new MosaicId(asset.mosaicId), UInt64.fromUint(asset.getRawAmount()))],
        // [NetworkCurrencyMosaic.createRelative(asset.relativeAmount)],
        asset.message !== undefined ? PlainMessage.create(asset.message) : PlainMessage.create(''),
        this.nemNode.network)
    const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
    const signedTransaction = account.sign(transferTransaction, this.nemNode.networkGenerationHash)
    return new Promise((resolve, reject) => {
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp
        .announce(signedTransaction)
        .subscribe(
          (response) => console.log(response),
          (error) => reject(error))
    })
  }

  async transactionHistory(id: string): Promise<TransactionHistory> {
    return new Promise((resolve, reject) => {
      let transaction: TransferTransaction
      this.transactionHttp.getTransaction(id)
      .pipe(
        map((item) => {
          console.log('transactionHistory', item)
          return item
        }),
        filter((item) => item instanceof TransferTransaction),
        map((item) => {
          transaction = item as TransferTransaction
          return transaction
        }),
        map((item) => this.blockHttp.getBlockByHeight(item.transactionInfo!.height.compact())),
        mergeMap((_) => _),
        map((block) => new TransactionHistory(
          transaction.transactionInfo!.id,
          transaction.mosaics.length !== 0 ? transaction.mosaics[0].amount.compact() / NemHelper.divisibility() : 0,  // ココ暫定. 後回し.
          transaction.maxFee.compact(),
          transaction.recipient instanceof Address ? transaction.recipient.plain() : '',
          transaction.signer !== undefined ? transaction.signer!.address.plain() : '',
          transaction.message.payload,
          block !== undefined ? new Date(block.timestamp.compact() + Date.UTC(2016, 3, 1, 0, 0, 0, 0)) : undefined,
          transaction.transactionInfo!.hash,
          transaction)),
      ).subscribe(
        (response) => resolve(response),
        (error) => reject(error))
      })
  }

  async transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistoryInfo> {
    try {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.nemNode.network)
      return await this._transactionHistory(publicAccount, new QueryParams(limit, id, Order.DESC))
    } catch (error) {
      throw error
    }
  }

  // TODO
  async unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.nemNode.network)
      this.accountHttp.unconfirmedTransactions(publicAccount, new QueryParams(limit, id, Order.DESC))
      .pipe(
        map((items) => {
          console.log('unconfirmedTransactions', items)
          return items
        }),
      ).subscribe(
        (response) => resolve(response),
        (error) => reject(error))
      })
  }

  private _transactionHistory(publicAccount: PublicAccount, query: QueryParams): Promise<TransactionHistoryInfo> {
    return new Promise((resolve, reject) => {
      let lastTransactionId: string
      let transactions: TransferTransaction[] = []
      this.accountHttp.transactions(publicAccount, query)
        .pipe(
          map((items) => {
            // console.log('transactionHistory', items)
            if (items.length === 0) {
              resolve(new TransactionHistoryInfo(undefined))
            }
            return items
          }),
          mergeMap((items) => transactions = items.filter((item) => item instanceof TransferTransaction)
            .map((item) => item as TransferTransaction)
            .filter((item) => item.transactionInfo !== undefined && item.transactionInfo instanceof TransactionInfo)),
          mergeMap((item) => {
            // console.log('transferTransction', item.mosaics[0].id.toHex(), item.transactionInfo!.hash, item)
            return zip(
              of(item),
              this.blockHttp.getBlockByHeight(item!.transactionInfo!.height.compact()),
              item!.mosaics[0].id instanceof MosaicId ?
                this.mosaicHttp.getMosaic(new MosaicId(item!.mosaics[0].id.toHex())).pipe(
                  map((mosaic) => mosaic.divisibility),
                  catchError((error) => of(0)), // Errorの場合は0を返すようにする
                ) : of(6), // NEMの場合はnamespaceIdしかとれないのでof(6)を返すようにする
            )
          }),
          map(([tx, block, divisibility]) => {
            // console.log('transactionHistory zip', tx, block, divisibility)
            return of(new TransactionHistory(
              tx.transactionInfo!.id,
              tx.mosaics.length !== 0 ? tx.mosaics[0].amount.compact() / Math.pow(10, divisibility) : 0,
              tx.maxFee.compact(),
              tx.recipient instanceof Address ? tx.recipient.plain() : '',
              tx.signer !== undefined ? tx.signer!.address.plain() : '',
              tx.message.payload,
              tx !== undefined ? new Date(block.timestamp.compact() + Date.UTC(2016, 3, 1, 0, 0, 0, 0)) : undefined,
              tx.transactionInfo!.hash,
              tx,
            ))
          }),
          combineAll(),
          map((items) => {
            lastTransactionId = transactions.slice(-1)[0].transactionInfo!.id
            return new TransactionHistoryInfo(lastTransactionId, items.sort((a, b) => {
              const aTime = a.date!.getTime()
              const bTime = b.date!.getTime()
              if (aTime > bTime) { return -1 }
              if (aTime < bTime) { return 1 }
              return 0
            }))
          }),
        ).subscribe(
          (response) => resolve(response),
          (error) => reject(error))
    })
  }

}
