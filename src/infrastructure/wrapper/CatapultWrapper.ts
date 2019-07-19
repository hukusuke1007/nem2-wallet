import { AccountHttp, MosaicHttp, TransactionHttp, BlockHttp, MosaicService, Account, Address,
   TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage,
   PublicAccount, QueryParams, TransactionInfo, Order, NamespaceHttp, NamespaceId, RegisterNamespaceTransaction, UInt64,
   AliasTransaction, AliasActionType,
   MosaicId, MosaicNonce, MosaicDefinitionTransaction, MosaicSupplyChangeTransaction, MosaicProperties, MosaicSupplyType,
   AggregateTransaction } from 'nem2-sdk'
import { mergeMap, map, combineAll, filter } from 'rxjs/operators'
import { ZoneId } from 'js-joda'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'
import { NemHelper } from '@/domain/helper/NemHelper'
import { Wallet } from '@/domain/entity/Wallet'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'

export class CatapultWrapper implements NemBlockchainWrapper {
  endpoint: string
  host: string
  port: string
  network: number
  networkGenerationHash: string
  accountHttp: AccountHttp
  mosaicHttp: MosaicHttp
  transactionHttp: TransactionHttp
  blockHttp: BlockHttp
  namespaceHttp: NamespaceHttp
  mosaicService: MosaicService

  constructor(host: string, port: string, network: number, networkGenerationHash: string) {
    this.host = host
    this.port = port
    this.network = network
    this.networkGenerationHash = networkGenerationHash
    this.endpoint = `${host}:${port}`

    this.accountHttp = new AccountHttp(this.endpoint)
    this.mosaicHttp = new MosaicHttp(this.endpoint)
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp)
    this.transactionHttp = new TransactionHttp(this.endpoint)
    this.blockHttp = new BlockHttp(this.endpoint)
    this.namespaceHttp = new NamespaceHttp(this.endpoint)
    console.log(this.host, this.port, this.network, this.endpoint, this.networkGenerationHash)
  }

  createAccount() {
    const account = Account.generateNewAccount(this.network)
    return new Wallet(
      account.address.plain(),
      account.publicKey,
      account.privateKey,
      account.address.networkType.valueOf(),
    )
  }

  async loadAccount(addr: string) {
    const address = Address.createFromRawAddress(addr)
    return new Promise((resolve, reject) => {
      this.accountHttp.getAccountInfo(address)
        .subscribe(
          (accountInfo) => resolve(accountInfo),
          (error) => reject(error))
    })
  }

  async loadBalance(addr: string) {
    const address = Address.createFromRawAddress(addr)
    return new Promise((resolve, reject) => {
      this.mosaicService.mosaicsAmountViewFromAddress(address)
        .pipe(
          mergeMap((_) => _ ),
        ).subscribe(
          (mosaic) => {
            console.log('mosaicsAmountViewFromAddress', mosaic)
            resolve(mosaic.relativeAmount()) },
          (error) => reject(error))
    })
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message?: string) {
    const recipientAddress = Address.createFromRawAddress(toAddress)
    const transferTransaction = TransferTransaction.create(
        Deadline.create(),
        recipientAddress,
        [NetworkCurrencyMosaic.createRelative(amount)],
        message !== undefined ? PlainMessage.create(message) : PlainMessage.create(''),
        this.network)
    const account = Account.createFromPrivateKey(privateKey, this.network)
    const signedTransaction = account.sign(transferTransaction, this.networkGenerationHash)
    return new Promise((resolve, reject) => {
      this.transactionHttp
        .announce(signedTransaction)
        .pipe(
          map((item) => new SendAssetResult(signedTransaction.hash, item.message)),
        )
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error))
    })
  }

  async transactionHistory(id: string) {
    return new Promise((resolve, reject) => {
      let transaction: TransferTransaction
      this.transactionHttp.getTransaction(id)
      .pipe(
        filter((item) => item instanceof TransferTransaction),
        map((item) => {
          transaction = item as TransferTransaction
          return transaction
        }),
        map((item) => this.blockHttp.getBlockByHeight(item.transactionInfo!.height.compact())),
        mergeMap((_) => _),
        map((block) => new TransactionHistory(
          transaction.transactionInfo!.id,
          transaction.mosaics.length !== 0 ? transaction.mosaics[0].amount.compact() / NemHelper.divisibility() : 0,  // ココ暫定. 後回し.
          transaction.maxFee.compact(),
          transaction.recipient instanceof Address ? transaction.recipient.plain() : '',
          transaction.signer !== undefined ? transaction.signer!.address.plain() : '',
          transaction.message.payload,
          new Date(block.timestamp.compact()),  // ここ暫定、ネメシスブロックの時間がわからんw
          transaction.transactionInfo!.hash,
          transaction)),
      ).subscribe(
        (response) => resolve(response),
        (error) => reject(error))
      })
  }

  async transactionHistoryAll(publicKey: string, limit: number, id?: string) {
    try {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.network)
      return await this._transactionHistory(publicAccount, new QueryParams(limit, id, Order.DESC))
    } catch (error) {
      throw error
    }
  }

  async checkNamespace(name: string) {
    return new Promise((resolve, reject) => {
      const namespace = new NamespaceId(name)
      this.namespaceHttp.getNamespace(namespace)
        .subscribe(
          (response) => {
            console.log('checkNamespace', response)
            resolve(response)
          },
          (error) => reject(error))
    })
  }

  async createNamespace(name: string, privateKey: string) {
    return new Promise((resolve, reject) => {
      const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
        Deadline.create(),
        name,
        UInt64.fromUint(1000),
        this.network)
      const account = Account.createFromPrivateKey(privateKey, this.network)
      const signedTransaction = account.sign(registerNamespaceTransaction, this.networkGenerationHash)
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => {
              console.log('createNamespace', response)
              resolve(response.message)
            },
            (error) => reject(error))
    })
  }

  async createMosaic(privateKey: string, maxAmount: number, supplyMutable: boolean, transferable: boolean, divisibility: number, durationCount?: number) {
    return new Promise((resolve, reject) => {
      const account = Account.createFromPrivateKey(privateKey, this.network)
      const nonce = MosaicNonce.createRandom()
      const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
          Deadline.create(),
          nonce,
          MosaicId.createFromNonce(nonce, account.publicAccount),
          MosaicProperties.create({
            supplyMutable,
            transferable,
            divisibility,
            duration: durationCount !== undefined ? UInt64.fromUint(durationCount) : undefined }),
          this.network)
      const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
        Deadline.create(),
        mosaicDefinitionTransaction.mosaicId,
        MosaicSupplyType.Increase,
        UInt64.fromUint(maxAmount),
        this.network)
      const aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(),
        [
          mosaicDefinitionTransaction.toAggregate(account.publicAccount),
          mosaicSupplyChangeTransaction.toAggregate(account.publicAccount),
        ],
        this.network,
        []);
      const signedTransaction = account.sign(aggregateTransaction, this.networkGenerationHash)
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => {
              console.log('createMosaic', response, mosaicDefinitionTransaction.mosaicId)
              resolve(mosaicDefinitionTransaction.mosaicId)
            },
            (error) => reject(error))
    })
  }

  async registeNamespaceToAddress(name: string, addr: string, privateKey: string) {
    return new Promise((resolve, reject) => {
      const namespaceId = new NamespaceId(name)
      const address = Address.createFromRawAddress(addr)
      const addressAliasTransaction = AliasTransaction.createForAddress(
        Deadline.create(),
        AliasActionType.Link,
        namespaceId,
        address,
        this.network)
      const account = Account.createFromPrivateKey(privateKey, this.network)
      const signedTransaction = account.sign(addressAliasTransaction, this.networkGenerationHash)
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => {
              console.log('registeNamespaceToAddress', response)
              resolve(response.message)
            },
            (error) => reject(error))
    })
  }

  async registeMosaicToNamespace(name: string, mosaicName: string, privateKey: string) {
    return new Promise((resolve, reject) => {
      const namespaceId = new NamespaceId(name)
      const mosaicId = new MosaicId(mosaicName)
      const mosaicAliasTransaction = AliasTransaction.createForMosaic(
        Deadline.create(),
        AliasActionType.Link,
        namespaceId,
        mosaicId,
        this.network)
      const account = Account.createFromPrivateKey(privateKey, this.network)
      const signedTransaction = account.sign(mosaicAliasTransaction, this.networkGenerationHash)
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => {
              console.log('registeMosaicToNamespace', response)
              resolve(response.message)
            },
            (error) => reject(error))
    })
  }

  private _transactionHistory(publicAccount: PublicAccount, query: QueryParams): Promise<TransactionHistory[]> {
    return new Promise((resolve, reject) => {
      let transactions: TransferTransaction[] = []
      this.accountHttp.transactions(publicAccount, query)
        .pipe(
          mergeMap((items) => transactions = items.filter((item) => item instanceof TransferTransaction)
            .map((item) => item as TransferTransaction)
            .filter((item) => item.transactionInfo !== undefined && item.transactionInfo instanceof TransactionInfo)),
          map((item) => this.blockHttp.getBlockByHeight(item.transactionInfo!.height.compact())),
          combineAll(),
          map((blocks) => {
            console.log(blocks)
            return transactions.map((item) => {
              const targetBlock = blocks.filter((block) => block.blockTransactionsHash === item.transactionInfo!.hash)[0]
              return new TransactionHistory(
                item.transactionInfo!.id,
                item.mosaics.length !== 0 ? item.mosaics[0].amount.compact() / NemHelper.divisibility() : 0,  // ココ暫定. 後回し.
                item.maxFee.compact(),
                item.recipient instanceof Address ? item.recipient.plain() : '',
                item.signer !== undefined ? item.signer!.address.plain() : '',
                item.message.payload,
                new Date(targetBlock.timestamp.compact()),  // ここ暫定、ネメシスブロックの時間がわからんw
                item.transactionInfo!.hash,
                item)
            })
          }),
        ).subscribe(
          (response) => resolve(response),
          (error) => reject(error))
    })
  }

}
