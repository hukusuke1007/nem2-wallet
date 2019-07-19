import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { AssetCreation } from '@/domain/entity/AssetCreation'

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
      const address = wallet!.address!

      const account = await this.walletRepository.loadAccount(address)
      console.log('account', account)

      const checkNamespace = await this.transactionRepository.checkNamespace(asset.namespace)
      console.log('createNamespace', checkNamespace)
      // // create
      // const createNamespace = await this.transactionRepository.createNamespace(asset.namespace, privateKey)
      // console.log('createNamespace', createNamespace)

      // const mosaicId = await this.transactionRepository.createMosaic(privateKey, asset)
      // console.log('createMosaic', mosaicId)

      // // register
      // const registeNamespaceToAddress = await this.transactionRepository.registeNamespaceToAddress(asset.namespace, address, privateKey)
      // console.log('registeNamespaceToAddress', registeNamespaceToAddress)

      // const registeMosaicToNamespace = await this.transactionRepository.registeMosaicToNamespace(asset.namespace, mosaicId, privateKey)
      // console.log('registeMosaicToNamespace', registeMosaicToNamespace)

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
