import { Wallet } from '@/domain/entity/Wallet'

export interface BlockchainWrapper {
  createAccount(): Wallet
  loadBalance(addr: string): Promise<any>
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<any>
}
