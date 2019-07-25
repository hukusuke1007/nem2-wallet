import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrow } from '@/domain/entity/AggregateEscrow'
import { Asset } from '@/domain/entity/firebase/Asset'
import { Collection } from '@1amageek/ballcap'

export interface FetchAssetExchangeUseCase {
  createAsset(asset: AssetCreation): Promise<string>
  loadAssetList(): Promise<Asset[]>
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
      console.log('asset', asset)
      const wallet = await this.walletRepository.loadWallet()
      if (wallet === undefined) { throw new Error('wallet is nothing..') }
      const privateKey = wallet!.privateKey!
      const address = wallet!.address!
      const namespace = asset.namespace
      const exchangeAmount = asset.exchangeAmount

      const account = await this.walletRepository.loadAccount(address)
      console.log('account', account.mosaics)

      const status = await this.transactionRepository.loadNamespace(namespace)
      console.log('status', status)
      if (status !== undefined) {
        return 'Already exist namespace.'
      }
      const createNamespace = await this.transactionRepository.createNamespace(namespace, privateKey, 100)
      console.log('createNamespace', createNamespace)

      const mosaic = await this.transactionRepository.createMosaic(privateKey, asset)
      console.log('createMosaic', mosaic)

      // const registeNamespaceToAddress = await this.transactionRepository.registNamespaceToAddress(namespace, address, privateKey)
      // console.log('registeNamespaceToAddress', registeNamespaceToAddress)

      // const registeMosaicToNamespace = await this.transactionRepository.registMosaicToNamespace(namespace, mosaic.mosaicId, privateKey)
      // console.log('registeMosaicToNamespace', registeMosaicToNamespace)

      const item = new Asset()
      item.uid = item.id
      item.namespace = namespace
      item.createAddress = address
      item.mosaicId = mosaic.mosaicId
      item.exchangeAmount = exchangeAmount
      await item.save()
      console.log('batch')
    } catch (error) {
      throw error
    }
    return 'SUCCESS'
  }

  async loadAssetList() {
    let results: Asset[] = []
    try {
      const dataSource = await Asset.collectionReference().get()
      const aaaa = dataSource.docs.map((item) => {
        if (item.exists) {
          return Asset.from<Asset>(item.data)
        }
      })
      console.log('loadAssetList', dataSource)
    } catch (error) {
      throw error
    }
    return results
  }

  async exchangeAsset() {
    try {
      // アグリゲートトランザクションの確認
      // const aggregateEscrowAsset = await this.transactionRepository.requestAggregateEscrowAsset(aggregateEscrow)
      // console.log('aggregateEscrowAsset', aggregateEscrowAsset)
      // const unconfirmedTransactions = await this.transactionRepository.unconfirmedTransactions(publicKey, 20)
      // console.log('unconfirmedTransactions', unconfirmedTransactions)

      // const consig = await this.transactionRepository.consigAggregate('335C1693B34AAD11A56FB8187E13A98BDE9467EBA3BAFEB04E8D6437AFC5F7A0')
      // console.log('consig', consig)

      // const loadNamespacesFromAccount = await this.walletRepository.loadNamespacesFromAccount(address)
      // console.log('loadNamespacesFromAccount', loadNamespacesFromAccount)
    } catch (error) {
      throw error
    }
  }

}
