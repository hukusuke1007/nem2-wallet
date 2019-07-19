import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'
import { AssetCreation } from '@/domain/entity/AssetCreation'

export interface TransactionRepository {
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<SendAssetResult>
  transactionHistory(id: string): Promise<TransactionHistory>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
  checkNamespace(name: string): Promise<any>
  createNamespace(name: string, privateKey: string): Promise<string>
  createSubNamespace(subName: string, rootName: string, privateKey: string): Promise<string>
  createMosaic(privateKey: string, asset: AssetCreation): Promise<string>
  registeNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<string>
  registeMosaicToNamespace(name: string, mosaicId: string, privateKey: string): Promise<string>
}
