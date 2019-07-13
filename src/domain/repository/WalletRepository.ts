import { Wallet } from '@/domain/entity/Wallet'

export interface WalletRepository {
  createWallet(): Wallet
  loadWallet(): Wallet | undefined
  loadBalance(): Promise<number>
}
