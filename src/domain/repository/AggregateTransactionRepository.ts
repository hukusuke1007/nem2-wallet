import { TransactionResult } from '@/domain/entity/TransactionResult'
import { AggregateEscrowDTO } from '@/domain/entity/AggregateEscrowDTO'
import { AggregateConsigInfo } from '@/domain/entity/AggregateConsigInfo'

export interface AggregateTransactionRepository {
  requestComplete(privateKey: string, aggregateTransactions: any[]): Promise<TransactionResult>
  requestAggregateEscrowAsset(dto: AggregateEscrowDTO): Promise<TransactionResult>
  consigAggregate(privateKey: string): Promise<TransactionResult>
  aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<AggregateConsigInfo>
}
