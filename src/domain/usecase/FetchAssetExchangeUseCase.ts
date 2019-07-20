import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrow } from '@/domain/entity/AggregateEscrow'

export interface FetchAssetExchangeUseCase {
  createAsset(asset: AssetCreation): Promise<any>
  loadPublishAssetList(): Promise<any>
  exchangeAsset(): Promise<any>
}

export class FetchAssetExchangeUseCaseImpl implements FetchAssetExchangeUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
  }

  // TODO: まだ実装途中
  async createAsset(asset: AssetCreation) {
    try {
      const wallet = await this.walletRepository.loadWallet()
      if (wallet === undefined) { throw new Error('wallet is nothing..') }
      const privateKey = wallet!.privateKey!
      const publicKey = wallet!.publicKey!
      const address = wallet!.address!

      const account = await this.walletRepository.loadAccount(address)
      console.log('account', account)

      // アグリゲートトランザクションの確認

      // const aggregateEscrowAsset = await this.transactionRepository.requestAggregateEscrowAsset(aggregateEscrow)
      // console.log('aggregateEscrowAsset', aggregateEscrowAsset)
      // const unconfirmedTransactions = await this.transactionRepository.unconfirmedTransactions(publicKey, 20)
      // console.log('unconfirmedTransactions', unconfirmedTransactions)

      // const consig = await this.transactionRepository.consigAggregate('335C1693B34AAD11A56FB8187E13A98BDE9467EBA3BAFEB04E8D6437AFC5F7A0')
      // console.log('consig', consig)

      // const loadNamespacesFromAccount = await this.walletRepository.loadNamespacesFromAccount(address)
      // console.log('loadNamespacesFromAccount', loadNamespacesFromAccount)

      // create
      // const createNamespace = await this.transactionRepository.createNamespace(asset.namespace, privateKey)
      // console.log('createNamespace', createNamespace)

      // const createSubNamesoace = await this.transactionRepository.createSubNamespace('coin', asset.namespace, privateKey)
      // console.log('createSubNamesoace', createSubNamesoace)

      // register
      // const registeNamespaceToAddress = await this.transactionRepository.registeNamespaceToAddress(asset.namespace, address, privateKey)
      // console.log('registeNamespaceToAddress', registeNamespaceToAddress)

      // const mosaicId = await this.transactionRepository.createMosaic(privateKey, asset)
      // console.log('createMosaic', mosaicId)

      // const registeMosaicToNamespace = await this.transactionRepository.registeMosaicToNamespace(asset.namespace, mosaicId, privateKey)
      // console.log('registeMosaicToNamespace', registeMosaicToNamespace)

      const history = await this.transactionRepository.transactionHistoryAll(wallet!.publicKey!, 100)

      // const loadNamespace = await this.transactionRepository.loadNamespace(asset.namespace)
      // console.log('createNamespace', loadNamespace)
    } catch (error) {
      throw error
    }
  }

  async loadPublishAssetList() {
    try {
    } catch (error) {
      throw error
    }
  }

  async exchangeAsset() {
    try {
    } catch (error) {
      throw error
    }
  }

}
