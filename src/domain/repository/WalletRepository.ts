import { Wallet } from '@/domain/entity/Wallet'

export interface WalletRepository {
  createWallet(): Wallet
  loadWallet(): Wallet
  loadBalance(): Promise<number>
}
