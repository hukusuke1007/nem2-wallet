import { TransactionHttp, Account, Address,
  Deadline, NamespaceHttp, NamespaceId, RegisterNamespaceTransaction, UInt64,
  AliasTransaction, AliasActionType,
  MosaicId } from 'nem2-sdk'
import { map, filter } from 'rxjs/operators'
import { NamespaceRepository } from '@/domain/repository/NamespaceRepository'
import { NamespaceEntity } from '@/domain/entity/NamespaceEntity'
import { NemNode } from '@/domain/configure/NemNode'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { ListenerWrapper } from '@/infrastructure/wrapper/ListenerWrapper'

export class NamespaceDataSource implements NamespaceRepository {
  nemNode: NemNode
  listenerWrapper: ListenerWrapper
  private transactionHttp: TransactionHttp
  private namespaceHttp: NamespaceHttp

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    this.transactionHttp = new TransactionHttp(nemNode.endpoint)
    this.namespaceHttp = new NamespaceHttp(nemNode.endpoint)
    this.listenerWrapper = new ListenerWrapper(nemNode.wsEndpoint)
  }

  async loadNamespace(name: string): Promise<NamespaceEntity> {
    return new Promise((resolve, reject) => {
      const namespace = new NamespaceId(name)
      this.namespaceHttp.getNamespace(namespace)
        .pipe(
          map((item) => {
            console.log('item', item)
            return item
          }),
          filter((item) => item.levels.length > 0),
          map((item) => new NamespaceEntity(name, item.levels[0].toHex(), item.owner.address.plain(), item.owner.publicKey)),
        ).subscribe(
          (response) => resolve(response),
          (error) => {
            if (this._errorNotFound(JSON.parse(error.message))) {
              resolve(undefined)
            } else {
              reject(error)
            }
          })
    })
  }

  async loadNamespacesFromAccount(addr: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
      this.namespaceHttp.getNamespacesFromAccount(address)
        .pipe(
          map((items) => items
            .filter((item) => item.levels.length > 0)
            .map((item) => new NamespaceEntity(name, item.levels[0].toHex(), item.owner.address.plain(), item.owner.publicKey)),
          ),
        ).subscribe(
          (response) => {
            console.log('loadNamespacesFromAccount', response)
            resolve(response)
          },
          (error) => reject(error))
    })
  }

  async createNamespace(name: string, privateKey: string, rentalBlock: number): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const registerNamespaceTransaction = this._createNamespaceTx(name, rentalBlock)
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const signedTransaction = account.sign(registerNamespaceTransaction, this.nemNode.networkGenerationHash)
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
        .subscribe(
          (response) => console.log(response),
          (error) => reject(error))
    })
  }

  async createSubNamespace(subName: string, rootName: string, privateKey: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const registerNamespaceTransaction = RegisterNamespaceTransaction.createSubNamespace(
        Deadline.create(),
        subName,
        rootName,
        this.nemNode.network)
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const signedTransaction = account.sign(registerNamespaceTransaction, this.nemNode.networkGenerationHash)
      console.log('createSubNamespace', registerNamespaceTransaction, signedTransaction)
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
        .subscribe(
          (response) => console.log(response),
          (error) => reject(error))
    })
  }

  async registMosaicToNamespace(name: string, mosaicName: string, privateKey: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const mosaicAliasTransaction = this._createMosaicToNamespaceTx(name, mosaicName)
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const signedTransaction = account.sign(mosaicAliasTransaction, this.nemNode.networkGenerationHash)
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('registeMosaicToNamespace', response),
            (error) => reject(error))
    })
  }

  async registNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const namespaceId = new NamespaceId(name)
      const address = Address.createFromRawAddress(addr)
      const addressAliasTransaction = AliasTransaction.createForAddress(
        Deadline.create(),
        AliasActionType.Link,
        namespaceId,
        address,
        this.nemNode.network)
      const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
      const signedTransaction = account.sign(addressAliasTransaction, this.nemNode.networkGenerationHash)
      // status
      this.listenerWrapper.loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('registeNamespaceToAddress', addressAliasTransaction, response),
            (error) => reject(error))
    })
  }

  createNamespaceTxAggregate(privateKey: string, name: string, rentalBlock: number): any {
    console.log(privateKey, name)
    const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
    return this._createNamespaceTx(name, rentalBlock).toAggregate(account.publicAccount)
  }

  createMosaicToNamespaceTxAggregate(privateKey: string, namespace: string, mosaicName: string): any {
    const account = Account.createFromPrivateKey(privateKey, this.nemNode.network)
    return this._createMosaicToNamespaceTx(namespace, mosaicName).toAggregate(account.publicAccount)
  }

  private _createNamespaceTx(name: string, rentalBlock: number): RegisterNamespaceTransaction {
    const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
      Deadline.create(),
      name,
      UInt64.fromUint(rentalBlock),
      this.nemNode.network)
    return registerNamespaceTransaction
  }

  private _createMosaicToNamespaceTx(namespace: string, mosaicName: string): AliasTransaction {
    const mosaicAliasTransaction = AliasTransaction.createForMosaic(
      Deadline.create(),
      AliasActionType.Link,
      new NamespaceId(namespace),
      new MosaicId(mosaicName),
      this.nemNode.network)
    return mosaicAliasTransaction
  }

  private _errorNotFound(error: any) {
    return 'statusCode' in error && error.statusCode === 404 ? true : false
  }
}
