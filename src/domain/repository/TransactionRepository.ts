import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrow } from '@/domain/entity/AggregateEscrow'

export interface TransactionRepository {
  loadStatus(addr: string): Promise<any>
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<SendAssetResult>
  requestAggregateEscrowAsset(dto: AggregateEscrow): Promise<string>
  consigAggregate(privateKey: string): Promise<string>
  transactionHistory(id: string): Promise<TransactionHistory>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
  unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<any>
  aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<any>
  loadNamespace(name: string): Promise<any>
  createNamespace(name: string, privateKey: string): Promise<any>
  createSubNamespace(subName: string, rootName: string, privateKey: string): Promise<string>
  createMosaic(privateKey: string, asset: AssetCreation): Promise<string>
  registeNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<string>
  registeMosaicToNamespace(name: string, mosaicId: string, privateKey: string): Promise<string>
}
