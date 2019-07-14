import { Wallet } from '@/domain/entity/Wallet'

export interface WalletRepository {
  createWallet(): Promise<Wallet>
  loadWallet(): Promise<Wallet | undefined>
  loadBalance(): Promise<number>
}
