import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionHistoryInfo } from '@/domain/entity/TransactionHistoryInfo'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { SendAsset } from '@/domain/entity/SendAsset'

export interface TransactionRepository {
  sendAsset(privateKey: string, asset: SendAsset): Promise<TransactionResult>
  transactionHistory(id: string): Promise<TransactionHistory>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistoryInfo>
  unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<any>
}
