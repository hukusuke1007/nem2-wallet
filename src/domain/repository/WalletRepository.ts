import { Wallet } from '@/domain/entity/Wallet'

export interface WalletRepository {
  createWallet(): Promise<Wallet>
  loadWallet(): Promise<Wallet | undefined>
  loadAccount(addr: string): Promise<any>
  loadBalance(addr: string): Promise<number>
}
