import { TransactionResult } from '@/domain/entity/TransactionResult'
import { AggregateEscrowDTO } from '@/domain/entity/AggregateEscrowDTO'
import { AggregateConsig } from '@/domain/entity/AggregateConsig'
import { AggregateConsigInfo } from '@/domain/entity/AggregateConsigInfo'

export interface AggregateTransactionRepository {
  requestComplete(privateKey: string, aggregateTransactions: any[]): Promise<TransactionResult>
  requestAggregateEscrowAsset(dto: AggregateEscrowDTO): Promise<TransactionResult>
  approvalConsigAggregate(privateKey: string, dto: AggregateConsig): Promise<TransactionResult>
  approvalConsigAggregateAll(privateKey: string): Promise<TransactionResult>
  aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<AggregateConsigInfo>
}
