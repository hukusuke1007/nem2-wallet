import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'

export interface TransactionRepository {
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<SendAssetResult>
  transactionHistory(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
}
