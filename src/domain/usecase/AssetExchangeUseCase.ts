import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { AggregateTransactionRepository } from '@/domain/repository/AggregateTransactionRepository'
import { MosaicRepository } from '@/domain/repository/MosaicRepository'
import { NamespaceRepository } from '@/domain/repository/NamespaceRepository'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrow } from '@/domain/entity/AggregateEscrow'
import { Asset } from '@/domain/entity/firebase/Asset'
import { firestore } from '@1amageek/ballcap'

export interface AssetExchangeUseCase {
  createAsset(asset: AssetCreation): Promise<string>
  loadAssetList(): Promise<Asset[]>
  exchangeAsset(): Promise<any>
}

export class AssetExchangeUseCaseImpl implements AssetExchangeUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository
  private aggregateRepository: AggregateTransactionRepository
  private mosaicRepository: MosaicRepository
  private namespaceRepository: NamespaceRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository, aggregateRepository: AggregateTransactionRepository, mosaicRepository: MosaicRepository, namespaceRepository: NamespaceRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
    this.aggregateRepository = aggregateRepository
    this.mosaicRepository = mosaicRepository
    this.namespaceRepository = namespaceRepository
  }

  async createAsset(asset: AssetCreation) {
    try {
      console.log('asset', asset)
      const wallet = await this.walletRepository.loadWallet()
      if (wallet === undefined) { throw new Error('wallet is nothing..') }
      const privateKey = wallet!.privateKey!
      const address = wallet!.address!
      const publicKey = wallet!.publicKey!
      const namespace = asset.namespace
      const exchangeAmount = asset.exchangeAmount

      const account = await this.walletRepository.loadAccount(address)
      console.log('account', account.mosaics)

      const status = await this.namespaceRepository.loadNamespace(namespace)
      console.log('status', status)
      if (status !== undefined) {
        return 'Already exist namespace.'
      }
      const namespaceTxAggregate = await this.namespaceRepository.createNamespaceTxAggregate(namespace, privateKey, 100)
      console.log('namespaceTxAggregate', namespaceTxAggregate)

      const mosaicAggregate = await this.mosaicRepository.createMosaicDefinitionTxAggregate(privateKey, asset)
      const mosaicId: string = mosaicAggregate.mosaicId
      console.log('mosaicDefinitionTxAggregate', mosaicAggregate)

      const mosaicSupplyChangeTxAggregate = await this.mosaicRepository.createMosaicSupplyChangeTxAggregate(privateKey, mosaicId, asset.maxAmount)
      console.log('mosaicSupplyChangeTxAggregate', mosaicSupplyChangeTxAggregate)

      const mosaicToNamespaceTxAggregate = await this.namespaceRepository.createMosaicToNamespaceTxAggregate(privateKey, namespace, mosaicId)
      console.log('mosaicToNamespaceTxAggregate', mosaicToNamespaceTxAggregate)

      const result = await this.aggregateRepository.requestComplete(privateKey, [
        namespaceTxAggregate,
        mosaicAggregate.aggregate,
        mosaicSupplyChangeTxAggregate,
        mosaicToNamespaceTxAggregate,
      ])
      console.log('result', result)

      const item = new Asset()
      item.uid = item.id
      item.namespace = namespace
      item.mosaicId = mosaicId
      item.exchangeAmount = exchangeAmount
      item.creatorAddress = address
      item.creatorPublicKey = publicKey
      await item.save()
      console.log('save')
    } catch (error) {
      throw error
    }
    return 'SUCCESS'
  }

  async loadAssetList() {
    let results: Asset[] = []
    try {
      const collectionRef = firestore.collection(`version/${Asset.version()}/${Asset.collectionName}`).orderBy('createdAt', 'desc')
      const snapshot = await collectionRef.get()
      results = snapshot.docs
        .filter((doc) => doc.exists)
        .map((doc) => {
          const asset = new Asset(doc.id)
          const data = doc.data()
          asset.setData(data)
          return asset
        })
      console.log('loadAssetList', results)
    } catch (error) {
      throw error
    }
    return results
  }

  async exchangeAsset() {
    try {
      // アグリゲートトランザクションの確認
      // const aggregateEscrowAsset = await this.aggregateTransactionRepository.requestAggregateEscrowAsset(aggregateEscrow)
      // console.log('aggregateEscrowAsset', aggregateEscrowAsset)
      // const unconfirmedTransactions = await this.transactionRepository.unconfirmedTransactions(publicKey, 20)
      // console.log('unconfirmedTransactions', unconfirmedTransactions)

      // const consig = await this.aggregateTransactionRepository.consigAggregate('335C1693B34AAD11A56FB8187E13A98BDE9467EBA3BAFEB04E8D6437AFC5F7A0')
      // console.log('consig', consig)

      // const loadNamespacesFromAccount = await this.walletRepository.loadNamespacesFromAccount(address)
      // console.log('loadNamespacesFromAccount', loadNamespacesFromAccount)
    } catch (error) {
      throw error
    }
  }

}
