import { AccountHttp, TransactionHttp, Account,
  TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage,
  PublicAccount, QueryParams, Order, UInt64,
  MosaicId, MosaicHttp,
  AggregateTransaction, Mosaic, HashLockTransaction, Listener, CosignatureTransaction, CosignatureSignedTransaction, AggregateTransactionCosignature, InnerTransaction, Address } from 'nem2-sdk'
import { AggregateTransactionRepository } from '@/domain/repository/AggregateTransactionRepository'
import { of, zip } from 'rxjs'
import { mergeMap, map, filter, catchError, combineAll } from 'rxjs/operators'
import { NemNode } from '@/domain/configure/NemNode'
import { ListenerWrapper } from '@/infrastructure/wrapper/ListenerWrapper'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { AggregateEscrowDTO } from '@/domain/entity/AggregateEscrowDTO'
import { AggregateConsigInfo } from '@/domain/entity/AggregateConsigInfo'
import { AggregateConsig } from '@/domain/entity/AggregateConsig'
import { MosaicDTO } from '@/domain/entity/MosaicDTO'
import { ZoneId, ChronoUnit } from 'js-joda';
import { NemHelper } from '@/domain/helper/NemHelper';

export class AggregateTransactionDataSource implements AggregateTransactionRepository {
  nemNode: NemNode
  listenerWrapper: ListenerWrapper
  private accountHttp: AccountHttp
  private transactionHttp: TransactionHttp
  private mosaicHttp: MosaicHttp

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    this.accountHttp = new AccountHttp(nemNode.endpoint)
    this.transactionHttp = new TransactionHttp(nemNode.endpoint)
    this.mosaicHttp = new MosaicHttp(nemNode.endpoint)
    this.listenerWrapper = new ListenerWrapper(nemNode.wsEndpoint)
  }

  async requestComplete(privateKey: string, aggregateTransactions: any[]): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(),
        aggregateTransactions,
        this.nemNode.network,
        [])
      const signedTransaction = account.sign(aggregateTransaction, this.nemNode.networkGenerationHash)
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('request', response),
            (error) => reject(error))
    })
  }

  async requestAggregateEscrowAsset(dto: AggregateEscrowDTO): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const receiverAccount = Account.createFromPrivateKey(dto.receiverPrivateKey, this.nemNode.network)
      const distributorPublicAccount = PublicAccount.createFromPublicKey(dto.distributorPublicKey, this.nemNode.network)
      const deadline = Deadline.create(23, ChronoUnit.HOURS)
      const receiverToDistributorTx = TransferTransaction.create(
        deadline,
        distributorPublicAccount.address,
        [NetworkCurrencyMosaic.createRelative(dto.exchangeNemAmount)],
        PlainMessage.create(`send ${dto.exchangeNemAmount} currency to distributor`),
        this.nemNode.network)

      const distributorToReceiverTx = TransferTransaction.create(
        deadline,
        receiverAccount.address,
        [new Mosaic(new MosaicId(dto.distributeAssetId), UInt64.fromUint(dto.distributeRawAmount))],
        PlainMessage.create(`send ${dto.distributeRawAmount} (${dto.distributeAssetId}) to receiver`),
        this.nemNode.network)
      const aggregateTransaction = AggregateTransaction.createBonded(
        deadline,
        [
          receiverToDistributorTx.toAggregate(receiverAccount.publicAccount),
          distributorToReceiverTx.toAggregate(distributorPublicAccount),
        ],
        this.nemNode.network)
      const signedTransaction = receiverAccount.sign(aggregateTransaction, this.nemNode.networkGenerationHash)
      console.log('Aggregate Transaction: ', signedTransaction.hash)
      const hashLockTransaction = HashLockTransaction.create(
        Deadline.create(),
        NetworkCurrencyMosaic.createRelative(10),
        UInt64.fromUint(480),
        signedTransaction,
        this.nemNode.network)
      const hashLockTransactionSigned = receiverAccount.sign(hashLockTransaction, this.nemNode.networkGenerationHash)
      // const listener = new Listener(this.wsEndpoint, WebSocket)
      this.listenerWrapper.listener.open().then(() => {
        this.transactionHttp
          .announce(hashLockTransactionSigned)
          .subscribe((x) => {
            console.log('hashLockTransactionSigned', x)
          }, (error) => reject(error))
        this.listenerWrapper.listener.confirmed(receiverAccount.address)
          .pipe(
            map((items) => {
              console.log('listener confirmed', items)
              return items
            }),
            filter((transaction) => transaction.transactionInfo !== undefined
                && transaction.transactionInfo.hash === hashLockTransactionSigned.hash),
            mergeMap((_) => this.transactionHttp.announceAggregateBonded(signedTransaction)),
            map((_) => new TransactionResult('SUCCESS', hashLockTransactionSigned.hash)),
          ).subscribe(
            (response) => resolve(response),
            (error) => {
              console.error('listener confirmed', error)
              reject(error)
            })
      }).catch((error) => reject(error))
    })
  }

  async approvalConsigAggregate(privateKey: string, dto: AggregateConsig): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const cosignAggregateBondedTransaction = (transaction: AggregateTransaction, consigAccount: Account): CosignatureSignedTransaction => {
        const cosignatureTransaction = CosignatureTransaction.create(transaction)
        return consigAccount.signCosignatureTransaction(cosignatureTransaction)
      }
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const cosignatureSignedTransaction = cosignAggregateBondedTransaction(dto.aggregateTransaction, account)
      console.log('cosignatureSignedTransaction', cosignatureSignedTransaction)
      this.listenerWrapper.loadStatus(account.address.plain(), cosignatureSignedTransaction.parentHash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction)
        // .pipe(
        //   map((_) => new TransactionResult('SUCCESS', cosignatureSignedTransaction.parentHash)),
        // )
        .subscribe(
          (response) => console.log(response),
          (error) => reject(error))
        })
  }

  async approvalConsigAggregateAll(privateKey: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const cosignAggregateBondedTransaction = (transaction: AggregateTransaction, consigAccount: Account): CosignatureSignedTransaction => {
        const cosignatureTransaction = CosignatureTransaction.create(transaction)
        return consigAccount.signCosignatureTransaction(cosignatureTransaction)
      }
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      this.accountHttp.aggregateBondedTransactions(account.publicAccount)
        .pipe(
          // map((items) => {
          //   console.log('consigAggregate', items)
          //   return items
          // }),
          mergeMap((_) => _),
          filter((_) => !_.signedByAccount(account.publicAccount)),
          map((transaction) => cosignAggregateBondedTransaction(transaction, account)),
          mergeMap((cosignatureSignedTransaction) => this.transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction)),
          map((_) => new TransactionResult('SUCCESS')),
        )
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error))
        })
  }

  async aggregateBondedTransactions(privateKey: string, limit: number, id?: string): Promise<AggregateConsigInfo> {
    return new Promise((resolve, reject) => {
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      let aggregateConsigInfo: AggregateConsigInfo
      let aggregateTransaction: AggregateTransaction
      this.accountHttp.aggregateBondedTransactions(account.publicAccount, new QueryParams(limit, id, Order.DESC))
        .pipe(
          map((items) => {
            console.log('aggregateBondedTransactions', items)
            if (items.length === 0) {
              resolve(new AggregateConsigInfo(undefined))
            }
            aggregateConsigInfo = new AggregateConsigInfo(items.slice(-1)[0].transactionInfo!.id)
            return items
          }),
          mergeMap((_) => _),
          // filter((_) => !_.signedByAccount(account.publicAccount)),
          map((item) => {
            aggregateTransaction = item
            return item.innerTransactions
              .filter((tx) => tx instanceof TransferTransaction)
              .map((tx) => tx as TransferTransaction)
            },
          ),
          filter((items) => items.length === 2),
          mergeMap((items) => {
            const mosaicId1 = items[0]!.mosaics[0].id
            const mosaicId2 = items[1]!.mosaics[0].id
            return zip(
              of(items),
              mosaicId1 instanceof MosaicId ? this.mosaicHttp.getMosaic(new MosaicId(mosaicId1.toHex())).pipe(
                map((mosaic) => new MosaicDTO(mosaicId1.toHex(), mosaic.divisibility)),
                catchError((error) => of(new MosaicDTO(mosaicId1.toHex(), 0))),
              ) : of(new MosaicDTO(mosaicId1.toHex(), 6)),
              mosaicId2 instanceof MosaicId ? this.mosaicHttp.getMosaic(new MosaicId(mosaicId2.toHex())).pipe(
                map((mosaic) => new MosaicDTO(mosaicId2.toHex(), mosaic.divisibility)),
                catchError((error) => of(new MosaicDTO(mosaicId2.toHex(), 0))),
              ) : of(new MosaicDTO(mosaicId2.toHex(), 6)),
            )
          }),
          map(([txs, xDTO, yDTO]) => {
            console.log('txs', txs)
            const aggregateConfig = new AggregateConsig()
            aggregateConfig.aggregateTransaction = aggregateTransaction
            aggregateConfig.deadline = new Date(aggregateTransaction.deadline.value.atZone(ZoneId.SYSTEM).toInstant().toEpochMilli())

            txs.forEach((tx, index) => {
              if (tx.recipient instanceof Address) {
                const recipient = tx.recipient as Address
                let divisibility: number = 0
                if (tx.mosaics[0].id.toHex() === xDTO.mosaicId) {
                  divisibility = xDTO.divisibility
                } else {
                  divisibility = yDTO.divisibility
                }
                console.log(account.publicAccount.address.plain(), recipient.plain(), tx.message.payload)
                if (index === 0) {
                  aggregateConfig.distributerAddress = recipient.plain()
                  aggregateConfig.distributerGetAmount = tx.mosaics[0].amount.compact() / Math.pow(10, divisibility)
                  aggregateConfig.distributerGetCurrency = tx.mosaics[0].id.toHex()
                } else {
                  aggregateConfig.receiverAddress = recipient.plain()
                  aggregateConfig.receiverGetAmount = tx.mosaics[0].amount.compact() / Math.pow(10, divisibility)
                  aggregateConfig.receiverGetCurrency = tx.mosaics[0].id.toHex()
                }
              }
            })
            return of(aggregateConfig)
          }),
          combineAll(),
          map((items) => {
            aggregateConsigInfo.consigs = items
            return aggregateConsigInfo
          }),
        ).subscribe(
          (response) => resolve(response),
          (error) => reject(error))
        })
  }

}
