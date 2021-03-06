import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { AggregateTransactionRepository } from '@/domain/repository/AggregateTransactionRepository'
import { MosaicRepository } from '@/domain/repository/MosaicRepository'
import { NamespaceRepository } from '@/domain/repository/NamespaceRepository'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrowDTO } from '@/domain/entity/AggregateEscrowDTO'
import { AggregateConsig } from '@/domain/entity/AggregateConsig'
import { AggregateConsigInfo } from '@/domain/entity/AggregateConsigInfo'
import { Asset } from '@/domain/entity/firebase/Asset'
import { AssetForm } from '@/domain/entity/AssetForm'
import { firestore } from '@1amageek/ballcap'

export interface AssetExchangeUseCase {
  createAsset(asset: AssetCreation): Promise<string>
  loadAssetList(): Promise<AssetForm[]>
  exchangeAsset(exchangeNemAmount: number, distributorPublicKey: string, distributeAmount: number, distributeAssetId: string): Promise<string>
  approvalConsigAggregate(dto: AggregateConsig): Promise<string>
  approvalConsigAggregateAll(): Promise<string>
  loadAggregateBondedTransactions(limit: number, id?: string): Promise<AggregateConsigInfo>
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
    let message: string
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
      const namespaceTxAggregate = await this.namespaceRepository.createNamespaceTxAggregate(privateKey, namespace, 100)
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
      message = `SUCCESS: ${result.hash}`
      console.log('result', message)

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
    return message
  }

  async loadAssetList() {
    const results: AssetForm[] = []
    try {
      const collectionRef = firestore.collection(Asset.collectionReference().path).orderBy('createdAt', 'desc')
      const snapshot = await collectionRef.get()
      const assets: Asset[] = snapshot.docs
        .filter((doc) => doc.exists)
        .map((doc) => Asset.fromSnapshot(doc))
      for (const asset of assets) {
        const mosaics = await this.walletRepository.loadBalance(asset.creatorAddress!)
        const list = mosaics.filter((item) => asset.mosaicId! === item.mosaicId)
        if (list.length !== 0) {
          const mosaic = list[0]
          const assetForm = new AssetForm(asset.namespace!, asset.mosaicId!, asset.exchangeAmount!,
            asset.creatorAddress!, asset.creatorPublicKey!, mosaic.relativeAmount, asset.createdAt.toDate())
          results.push(assetForm)
        }
      }
      console.log('loadAssetList', results)
    } catch (error) {
      throw error
    }
    return results
  }

  async exchangeAsset(exchangeNemAmount: number, distributorPublicKey: string, distributeAmount: number, distributeAssetId: string) {
    let message: string
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      const mosaicInfo = await this.mosaicRepository.loadMosaicInfo(distributeAssetId)
      const distributeRawAmount = distributeAmount * Math.pow(10, mosaicInfo.divisibility)
      const dto = new AggregateEscrowDTO(privateKey, exchangeNemAmount, distributorPublicKey, distributeRawAmount, distributeAssetId)
      const result = await this.aggregateRepository.requestAggregateEscrowAsset(dto)
      message = `SUCCESS: ${result.hash}`
      console.log('aggregateEscrowAsset', message)
    } catch (error) {
      throw error
    }
    return message
  }

  async approvalConsigAggregate(dto: AggregateConsig) {
    let message: string
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      const result = await this.aggregateRepository.approvalConsigAggregate(privateKey, dto)
      message = `SUCCESS: ${result.hash}`
      console.log('consigAggregate', message)
    } catch (error) {
      throw error
    }
    return message
  }

  async approvalConsigAggregateAll() {
    let message: string
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      const result = await this.aggregateRepository.approvalConsigAggregateAll(privateKey)
      message = `SUCCESS: ${result.hash}`
      console.log('consigAggregate', message)
    } catch (error) {
      throw error
    }
    return message
  }

  async loadAggregateBondedTransactions(limit: number, id?: string) {
    let result: AggregateConsigInfo
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      result = await this.aggregateRepository.aggregateBondedTransactions(privateKey, limit, id)
      console.log('loadAggregateBondedTransactions', result)
    } catch (error) {
      throw error
    }
    return result
  }

}
