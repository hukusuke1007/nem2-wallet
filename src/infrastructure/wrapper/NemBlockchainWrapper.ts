import { Wallet } from '@/domain/entity/Wallet'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionResult } from '@/domain/entity/TransactionResult'

export interface NemBlockchainWrapper {
  createAccount(): Wallet
  loadAccount(addr: string): Promise<any>
  loadBalance(addr: string): Promise<number>
  loadStatus(addr: string, hash: string): Promise<TransactionResult>
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<TransactionResult>
  requestAggregateEscrowAsset(receiverPrivateKey: string, sendAmount: number, distributorPublicKey: string, mosaicAmount: number, mosaicName: string, mosaicNamespaceName: string): Promise<TransactionResult>
  consigAggregate(privateKey: string): Promise<TransactionResult>
  transactionHistory(id: string): Promise<TransactionHistory>
  transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
  unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]>
  aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<any[]>
  loadNamespace(name: string): Promise<any>
  loadNamespacesFromAccount(addr: string): Promise<any>
  createNamespace(name: string, privateKey: string): Promise<TransactionResult>
  createSubNamespace(subName: string, rootName: string, privateKey: string): Promise<TransactionResult>
  createMosaic(privateKey: string, maxAmount: number, supplyMutable: boolean, transferable: boolean, divisibility: number, durationCount?: number): Promise<TransactionResult>
  registeNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<TransactionResult>
  registeMosaicToNamespace(name: string, mosaicName: string, privateKey: string): Promise<TransactionResult>
}
