import { TransactionResult } from '@/domain/entity/TransactionResult'

export interface AggregateTransactionRepository {
  requestComplete(privateKey: string, aggregateTransactions: any[]): Promise<TransactionResult>
  requestAggregateEscrowAsset(receiverPrivateKey: string, sendAmount: number, distributorPublicKey: string, mosaicAmount: number, mosaicName: string, mosaicNamespaceName: string): Promise<TransactionResult>
  consigAggregate(privateKey: string): Promise<TransactionResult>
  aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<any[]>
}
