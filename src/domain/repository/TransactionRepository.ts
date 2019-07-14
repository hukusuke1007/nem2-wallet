import { TransactionHistory } from '@/domain/entity/TransactionHistory'

export interface TransactionRepository {
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<string>
  transactionHistory(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
}
