import { AccountHttp, MosaicHttp, TransactionHttp, Account, Deadline, UInt64,
  MosaicId, MosaicNonce, MosaicDefinitionTransaction, MosaicSupplyChangeTransaction, MosaicProperties, MosaicSupplyType,
  AggregateTransaction, Mosaic} from 'nem2-sdk'
// import { mergeMap, map, combineAll, filter } from 'rxjs/operators'
import { MosaicRepository } from '@/domain/repository/MosaicRepository'
import { MosaicEntity } from '@/domain/entity/MosaicEntity'
import { NemNode } from '@/domain/configure/NemNode'
import { ListenerWrapper } from '@/infrastructure/wrapper/ListenerWrapper'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { MosaicAggregate } from '@/domain/entity/MosaicAggregate'
import { map } from 'rxjs/operators';

type MosaicDefinitionTransactionInfo = {
  mosaicId: string,
  transaction: MosaicDefinitionTransaction,
}

export class MosaicDataSource implements MosaicRepository {
  nemNode: NemNode
  listenerWrapper: ListenerWrapper
  // private accountHttp: AccountHttp
  private mosaicHttp: MosaicHttp
  private transactionHttp: TransactionHttp

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    // this.accountHttp = new AccountHttp(nemNode.endpoint)
    this.mosaicHttp = new MosaicHttp(nemNode.endpoint)
    this.transactionHttp = new TransactionHttp(nemNode.endpoint)
    this.listenerWrapper = new ListenerWrapper(nemNode.wsEndpoint)
  }

  async loadMosaicInfo(id: string): Promise<MosaicEntity>  {
    return new Promise((resolve, reject) => {
      this.mosaicHttp.getMosaic(new MosaicId(id))
      .pipe(
        map((item) => new MosaicEntity(
          id,
          item.owner.address.plain(),
          item.owner.publicKey,
          item.divisibility,
        )),
      ).subscribe(
        (response) => resolve(response),
        (error) => reject(error))
    })
  }

  async createMosaic(privateKey: string, asset: AssetCreation): Promise<MosaicEntity> {
    return new Promise((resolve, reject) => {
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const mosaicDefinitionTransaction = this._createMosaicDefinitionTx(privateKey, asset).transaction
      const mosaicSupplyChangeTransaction = this._createMosaicSupplyChangeTx(mosaicDefinitionTransaction.mosaicId.toHex(), asset.maxAmount)
      const aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(),
        [
          mosaicDefinitionTransaction.toAggregate(account.publicAccount),
          mosaicSupplyChangeTransaction.toAggregate(account.publicAccount),
        ],
        this.nemNode.network,
        [])
      const signedTransaction = account.sign(aggregateTransaction, this.nemNode.networkGenerationHash)
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(new MosaicEntity(
          mosaicDefinitionTransaction.mosaicId.toHex(),
          account.address.plain(),
          account.publicAccount.publicKey,
          asset.divisibility,
          response.hash),
        )).catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('createMosaic', response, mosaicDefinitionTransaction.mosaicId),
            (error) => reject(error))
    })
  }

  createMosaicDefinitionTxAggregate(privateKey: string, asset: AssetCreation): MosaicAggregate {
    const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
    const txInfo = this._createMosaicDefinitionTx(privateKey, asset)
    return new MosaicAggregate(txInfo.mosaicId, txInfo.transaction.toAggregate(account.publicAccount))
  }

  createMosaicSupplyChangeTxAggregate(privateKey: string, mosaicId: string, maxAmount: number): any {
    const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
    return this._createMosaicSupplyChangeTx(mosaicId, maxAmount).toAggregate(account.publicAccount)
  }

  private _createMosaicDefinitionTx(privateKey: string, asset: AssetCreation): MosaicDefinitionTransactionInfo {
    const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
    const nonce = MosaicNonce.createRandom()
    const mosaicId = MosaicId.createFromNonce(nonce, account.publicAccount)
    const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
        Deadline.create(),
        nonce,
        mosaicId,
        MosaicProperties.create({
          supplyMutable: asset.supplyMutable,
          transferable: asset.transferable,
          divisibility: asset.divisibility,
          duration: asset.durationCount !== undefined ? UInt64.fromUint(asset.durationCount) : undefined }),
        this.nemNode.network)
    return { mosaicId: mosaicId.toHex(), transaction: mosaicDefinitionTransaction }
  }

  private _createMosaicSupplyChangeTx(mosaicId: string, maxAmount: number): MosaicSupplyChangeTransaction {
    const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
      Deadline.create(),
      new MosaicId(mosaicId),
      MosaicSupplyType.Increase,
      UInt64.fromUint(maxAmount),
      this.nemNode.network)
    return mosaicSupplyChangeTransaction
  }
}
