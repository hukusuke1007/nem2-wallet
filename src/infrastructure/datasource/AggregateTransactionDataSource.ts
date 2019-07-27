import { AccountHttp, TransactionHttp, Account,
  TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage,
  PublicAccount, QueryParams, Order, UInt64,
  MosaicId,
  AggregateTransaction, Mosaic, HashLockTransaction, Listener, CosignatureTransaction, CosignatureSignedTransaction, AggregateTransactionCosignature, InnerTransaction } from 'nem2-sdk'
import { AggregateTransactionRepository } from '@/domain/repository/AggregateTransactionRepository'
import { mergeMap, map, filter } from 'rxjs/operators'
import { NemNode } from '@/domain/configure/NemNode'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { ListenerWrapper } from '@/infrastructure/wrapper/ListenerWrapper'

export class AggregateTransactionDataSource implements AggregateTransactionRepository {
  nemNode: NemNode
  listenerWrapper: ListenerWrapper
  private accountHttp: AccountHttp
  private transactionHttp: TransactionHttp

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    this.accountHttp = new AccountHttp(nemNode.endpoint)
    this.transactionHttp = new TransactionHttp(nemNode.endpoint)
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

  async requestAggregateEscrowAsset(receiverPrivateKey: string, sendAmount: number, distributorPublicKey: string, mosaicAmount: number, mosaicName: string, mosaicNamespaceName: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const receiverAccount = Account.createFromPrivateKey(receiverPrivateKey, this.nemNode.network)
      const distributorPublicAccount = PublicAccount.createFromPublicKey(distributorPublicKey, this.nemNode.network)
      const receiverToDistributorTx = TransferTransaction.create(
        Deadline.create(),
        distributorPublicAccount.address,
        [NetworkCurrencyMosaic.createRelative(sendAmount)],
        PlainMessage.create(`send ${sendAmount} currency to distributor`),
        this.nemNode.network)

      const distributorToReceiverTx = TransferTransaction.create(
        Deadline.create(),
        receiverAccount.address,
        [new Mosaic(new MosaicId(mosaicName), UInt64.fromUint(mosaicAmount))],
        PlainMessage.create(`send ${mosaicAmount} ${mosaicNamespaceName} (${mosaicName}) to receiver`),
        this.nemNode.network)
      const aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(),
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

  async consigAggregate(privateKey: string): Promise<TransactionResult> {
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


  async aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.nemNode.network)
      this.accountHttp.aggregateBondedTransactions(publicAccount, new QueryParams(limit, id, Order.DESC))
        .pipe(
          map((items) => {
            console.log('aggregateBondedTransactions', items)
            return items
          }),
        ).subscribe(
          (response) =>  {
            console.log('aggregateBondedTransactions', response)
            resolve(response)
          }, (error) => {
            console.error(error)
            reject(error)
          })
        })
  }

}
