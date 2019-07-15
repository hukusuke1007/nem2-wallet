import { Wallet } from '@/domain/entity/Wallet'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'

export interface NemBlockchainWrapper {
  createAccount(): Wallet
  loadBalance(addr: string): Promise<number | any>
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<SendAssetResult | any>
  transactionHistory(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[] | any>
}
