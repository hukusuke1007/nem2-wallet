import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionResult } from '@/domain/entity/TransactionResult'

export interface TransactionRepository {
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<TransactionResult>
  transactionHistory(id: string): Promise<TransactionHistory>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
  unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<any>
}
