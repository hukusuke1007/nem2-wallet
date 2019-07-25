import { NamespaceRepository } from '@/domain/repository/NamespaceRepository'
import { NamespaceEntity } from '@/domain/entity/NamespaceEntity'
import { TransactionResult } from '@/domain/entity/TransactionResult'

export interface NamespaceRepository {
  loadNamespace(name: string): Promise<NamespaceEntity>
  loadNamespacesFromAccount(addr: string): Promise<NamespaceEntity[]>
  createNamespace(name: string, privateKey: string, rentalBlock: number): Promise<TransactionResult>
  createSubNamespace(subName: string, rootName: string, privateKey: string): Promise<TransactionResult>
  registNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<TransactionResult>
  registMosaicToNamespace(name: string, mosaicName: string, privateKey: string): Promise<TransactionResult>
  createNamespaceTxAggregate(privateKey: string, name: string, rentalBlock: number): any
  createMosaicToNamespaceTxAggregate(privateKey: string, namespace: string, mosaicName: string): any
}
