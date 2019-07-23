import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrow } from '@/domain/entity/AggregateEscrow'

export interface TransactionRepository {
  loadStatus(addr: string): Promise<any>
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<TransactionResult>
  requestAggregateEscrowAsset(dto: AggregateEscrow): Promise<TransactionResult>
  consigAggregate(privateKey: string): Promise<TransactionResult>
  transactionHistory(id: string): Promise<TransactionHistory>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
  unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<any>
  aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<any>
  loadNamespace(name: string): Promise<any>
  createNamespace(name: string, privateKey: string): Promise<TransactionResult>
  createSubNamespace(subName: string, rootName: string, privateKey: string): Promise<TransactionResult>
  createMosaic(privateKey: string, asset: AssetCreation): Promise<TransactionResult>
  registeNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<TransactionResult>
  registeMosaicToNamespace(name: string, mosaicId: string, privateKey: string): Promise<TransactionResult>
}
