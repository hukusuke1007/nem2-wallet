import { Wallet } from '@/domain/entity/Wallet'

export interface BlockchainWrapper {
  createAccount(): Wallet
  loadAccount(address: string): Promise<any>
  sendCoin(): Promise<any>
  sendAsset(): Promise<any>
}
