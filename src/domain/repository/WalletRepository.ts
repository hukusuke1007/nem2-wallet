import { Wallet } from '@/domain/entity/Wallet'
import { AssetMosaic } from '@/domain/entity/AssetMosaic'

export interface WalletRepository {
  createWallet(): Promise<Wallet>
  loadWallet(): Promise<Wallet | undefined>
  loadAccount(addr: string): Promise<any>
  loadBalance(addr: string): Promise<AssetMosaic[]>
}
