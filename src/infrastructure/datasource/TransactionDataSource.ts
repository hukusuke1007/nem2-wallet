import { AccountHttp, MosaicHttp, TransactionHttp, BlockHttp, Account, Address,
  TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage,
  PublicAccount, QueryParams, TransactionInfo, Order } from 'nem2-sdk'
import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { mergeMap, map, combineAll, filter } from 'rxjs/operators'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { NemNode } from '@/domain/configure/NemNode'
import { NemHelper } from '@/domain/helper/NemHelper'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { ListenerWrapper } from '@/infrastructure/wrapper/ListenerWrapper'

export class TransactionDataSource implements TransactionRepository {
  nemNode: NemNode
  listenerWrapper: ListenerWrapper
  private accountHttp: AccountHttp
  private transactionHttp: TransactionHttp
  private blockHttp: BlockHttp

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    this.accountHttp = new AccountHttp(nemNode.endpoint)
    this.transactionHttp = new TransactionHttp(nemNode.endpoint)
    this.blockHttp = new BlockHttp(nemNode.endpoint)
    this.listenerWrapper = new ListenerWrapper(nemNode.wsEndpoint)
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<TransactionResult> {
    const recipientAddress = Address.createFromRawAddress(toAddress)
    const transferTransaction = TransferTransaction.create(
        Deadline.create(),
        recipientAddress,
        [NetworkCurrencyMosaic.createRelative(amount)],
        message !== undefined ? PlainMessage.create(message) : PlainMessage.create(''),
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

  async transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]> {
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

  private _transactionHistory(publicAccount: PublicAccount, query: QueryParams): Promise<TransactionHistory[]> {
    return new Promise((resolve, reject) => {
      let transactions: TransferTransaction[] = []
      this.accountHttp.transactions(publicAccount, query)
        .pipe(
          map((item) => {
            console.log(item)
            if (item.length === 0) {
              resolve([])
            }
            return item
          }),
          mergeMap((items) => transactions = items.filter((item) => item instanceof TransferTransaction)
            .map((item) => item as TransferTransaction)
            .filter((item) => item.transactionInfo !== undefined && item.transactionInfo instanceof TransactionInfo)),
          map((item) =>  this.blockHttp.getBlockByHeight(item.transactionInfo!.height.compact())),
          combineAll(),
          map((blocks) => {
            return transactions.map((item) => {
              const targetBlock = blocks.filter((block) => block.height.compact() === item.transactionInfo!.height.compact())[0]
              return new TransactionHistory(
                item.transactionInfo!.id,
                item.mosaics.length !== 0 ? item.mosaics[0].amount.compact() / NemHelper.divisibility() : 0,  // ココ暫定. 後回し.
                item.maxFee.compact(),
                item.recipient instanceof Address ? item.recipient.plain() : '',
                item.signer !== undefined ? item.signer!.address.plain() : '',
                item.message.payload,
                targetBlock !== undefined ? new Date(targetBlock.timestamp.compact() + Date.UTC(2016, 3, 1, 0, 0, 0, 0)) : undefined,
                item.transactionInfo!.hash,
                item)
            })
          }),
        ).subscribe(
          (response) => resolve(response),
          (error) => reject(error))
    })
  }

}
