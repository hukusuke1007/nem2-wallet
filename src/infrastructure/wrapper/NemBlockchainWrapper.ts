import { Wallet } from '@/domain/entity/Wallet'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'

export interface NemBlockchainWrapper {
  createAccount(): Wallet
  loadAccount(addr: string): Promise<any>
  loadBalance(addr: string): Promise<number | any>
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<SendAssetResult | any>
  transactionHistory(id: string): Promise<TransactionHistory | any>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[] | any>
  checkNamespace(name: string): Promise<any>
  createNamespace(name: string, privateKey: string): Promise<string | any>
  createMosaic(privateKey: string, maxAmount: number, supplyMutable: boolean, transferable: boolean, divisibility: number, durationCount?: number): Promise<string | any>
  registeNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<string | any>
  registeMosaicToNamespace(name: string, mosaicName: string, privateKey: string): Promise<string | any>
}
