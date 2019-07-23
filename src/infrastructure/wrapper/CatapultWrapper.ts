import { AccountHttp, MosaicHttp, TransactionHttp, BlockHttp, MosaicService, Account, Address,
   TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage,
   PublicAccount, QueryParams, TransactionInfo, Order, NamespaceHttp, NamespaceId, RegisterNamespaceTransaction, UInt64,
   AliasTransaction, AliasActionType,
   MosaicId, MosaicNonce, MosaicDefinitionTransaction, MosaicSupplyChangeTransaction, MosaicProperties, MosaicSupplyType,
   AggregateTransaction, Mosaic, HashLockTransaction, Listener, CosignatureTransaction, CosignatureSignedTransaction, TransactionStatusError } from 'nem2-sdk'
import { mergeMap, map, combineAll, filter } from 'rxjs/operators'
import { ZoneId } from 'js-joda'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'
import { NemHelper } from '@/domain/helper/NemHelper'
import { Wallet } from '@/domain/entity/Wallet'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { TransactionError } from '@/domain/entity/TransactionError'

export class CatapultWrapper implements NemBlockchainWrapper {
  endpoint: string
  wsEndpoint: string
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
  listener: Listener

  constructor(host: string, ws: string, port: string, network: number, networkGenerationHash: string) {
    this.host = host
    this.port = port
    this.network = network
    this.networkGenerationHash = networkGenerationHash
    this.endpoint = `${host}:${port}`
    this.wsEndpoint = `${ws}:${port}`

    console.log(this.endpoint, this.wsEndpoint)

    this.accountHttp = new AccountHttp(this.endpoint)
    this.mosaicHttp = new MosaicHttp(this.endpoint)
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp)
    this.transactionHttp = new TransactionHttp(this.endpoint)
    this.blockHttp = new BlockHttp(this.endpoint)
    this.namespaceHttp = new NamespaceHttp(this.endpoint)
    this.listener = new Listener(this.wsEndpoint, WebSocket)
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
          (accountInfo) => {
            accountInfo.mosaics.forEach((item) => {
              console.log('mosaic', item.id.toHex(), item.amount.compact())
            })
            resolve(accountInfo)
          },
          (error) => reject(error))
    })
  }

  async loadBalance(addr: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
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

  async loadStatus(addr: string, hash: string): Promise<TransactionResult> {
    try {
      return await this._loadStatus(addr, hash)
    } catch (error) {
      throw error
    }
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<TransactionResult> {
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
      // status
      this._loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp
        .announce(signedTransaction)
        .subscribe(
          (response) => console.log(response),
          (error) => reject(error))
    })
  }

  async requestAggregateEscrowAsset(receiverPrivateKey: string, sendAmount: number, distributorPublicKey: string, mosaicAmount: number, mosaicName: string, mosaicNamespaceName: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const receiverAccount = Account.createFromPrivateKey(receiverPrivateKey, this.network)
      const distributorPublicAccount = PublicAccount.createFromPublicKey(distributorPublicKey, this.network)
      const receiverToDistributorTx = TransferTransaction.create(
        Deadline.create(),
        distributorPublicAccount.address,
        [NetworkCurrencyMosaic.createRelative(sendAmount)],
        PlainMessage.create(`send ${sendAmount} currency to distributor`),
        this.network)
      const distributorToReceiverTx = TransferTransaction.create(
        Deadline.create(),
        receiverAccount.address,
        [new Mosaic(new MosaicId(mosaicName), UInt64.fromUint(mosaicAmount))],
        PlainMessage.create(`send ${mosaicAmount} ${mosaicNamespaceName} (${mosaicName}) to receiver`),
        this.network);
      const aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(),
        [
          receiverToDistributorTx.toAggregate(receiverAccount.publicAccount),
          distributorToReceiverTx.toAggregate(distributorPublicAccount),
        ],
        this.network)
      const signedTransaction = receiverAccount.sign(aggregateTransaction, this.networkGenerationHash)
      console.log('Aggregate Transaction: ', signedTransaction.hash)
      const hashLockTransaction = HashLockTransaction.create(
        Deadline.create(),
        NetworkCurrencyMosaic.createRelative(10),
        UInt64.fromUint(480),
        signedTransaction,
        this.network)
      const hashLockTransactionSigned = receiverAccount.sign(hashLockTransaction, this.networkGenerationHash)
      // const listener = new Listener(this.wsEndpoint, WebSocket)
      this.listener.open().then(() => {
        this.transactionHttp
          .announce(hashLockTransactionSigned)
          .subscribe((x) => {
            console.log('hashLockTransactionSigned', x)
          }, (error) => reject(error))
        this.listener.confirmed(receiverAccount.address)
          .pipe(
            map((items) => {
              console.log('listener confirmed', items)
              return items
            }),
            filter((transaction) => transaction.transactionInfo !== undefined
                && transaction.transactionInfo.hash === hashLockTransactionSigned.hash),
            mergeMap((_) => this.transactionHttp.announceAggregateBonded(signedTransaction)),
            map((_) => new TransactionResult('SUCCESS', hashLockTransactionSigned.hash)),
          ).subscribe(
            (response) => resolve(response),
            (error) => {
              console.error('listener confirmed', error)
              reject(error)
            })
      }).catch((error) => reject(error))
    })
  }

  async consigAggregate(privateKey: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const cosignAggregateBondedTransaction = (transaction: AggregateTransaction, consigAccount: Account): CosignatureSignedTransaction => {
        const cosignatureTransaction = CosignatureTransaction.create(transaction)
        return consigAccount.signCosignatureTransaction(cosignatureTransaction)
      }
      const account = Account.createFromPrivateKey(privateKey, this.network)
      this.accountHttp.aggregateBondedTransactions(account.publicAccount)
        .pipe(
          // map((items) => {
          //   console.log('consigAggregate', items)
          //   return items
          // }),
          mergeMap((_) => _),
          filter((_) => !_.signedByAccount(account.publicAccount)),
          map((transaction) => cosignAggregateBondedTransaction(transaction, account)),
          mergeMap((cosignatureSignedTransaction) => this.transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction)),
          map((_) => new TransactionResult('SUCCESS')),
        )
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error))
        })
  }

  async transactionHistory(id: string): Promise<TransactionHistory> {
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
          block !== undefined ? new Date(block.timestamp.compact() + Date.UTC(2016, 3, 1, 0, 0, 0, 0)) : undefined,
          transaction.transactionInfo!.hash,
          transaction)),
      ).subscribe(
        (response) => resolve(response),
        (error) => reject(error))
      })
  }

  async transactionHistoryAll(publicKey: string, limit: number, id?: string): Promise<TransactionHistory[]> {
    try {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.network)
      return await this._transactionHistory(publicAccount, new QueryParams(limit, id, Order.DESC))
    } catch (error) {
      throw error
    }
  }

  // TODO
  async unconfirmedTransactions(publicKey: string, limit: number, id?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.network)
      this.accountHttp.unconfirmedTransactions(publicAccount, new QueryParams(limit, id, Order.DESC))
      .pipe(
        map((items) => {
          console.log('unconfirmedTransactions', items)
          return items
        }),
      ).subscribe(
        (response) => resolve(response),
        (error) => reject(error))
      })
  }

  async aggregateBondedTransactions(publicKey: string, limit: number, id?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.network)
      this.accountHttp.aggregateBondedTransactions(publicAccount, new QueryParams(limit, id, Order.DESC))
        .pipe(
          map((items) => {
            console.log('aggregateBondedTransactions', items)
            return items
          }),
        ).subscribe(
          (response) =>  {
            console.log('aggregateBondedTransactions', response)
            resolve(response)
          }, (error) => {
            console.error(error)
            reject(error)
          })
        })
  }

  async loadNamespace(name: string) {
    return new Promise((resolve, reject) => {
      const namespace = new NamespaceId(name)
      this.namespaceHttp.getNamespace(namespace)
        .subscribe(
          (response) => {
            console.log('loadNamespace', response)
            resolve(response)
          },
          (error) => reject(error))
    })
  }

  async loadNamespacesFromAccount(addr: string) {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
      this.namespaceHttp.getNamespacesFromAccount(address)
        .subscribe(
          (response) => {
            console.log('loadNamespacesFromAccount', response)
            resolve(response)
          },
          (error) => reject(error))
    })
  }

  async createNamespace(name: string, privateKey: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const rentalBlock = 1000 // 20 * 86400 / 15 // duration ≈ numberOfDays * 86400 / blockGenerationTargetTime
      const registerNamespaceTransaction = RegisterNamespaceTransaction.createRootNamespace(
        Deadline.create(),
        name,
        UInt64.fromUint(rentalBlock),
        this.network)
      const account = Account.createFromPrivateKey(privateKey, this.network)
      const signedTransaction = account.sign(registerNamespaceTransaction, this.networkGenerationHash)
      // status
      this._loadStatus(account.address.plain(), signedTransaction.hash)
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
        this.network)
      const account = Account.createFromPrivateKey(privateKey, this.network)
      const signedTransaction = account.sign(registerNamespaceTransaction, this.networkGenerationHash)
      console.log('createSubNamespace', registerNamespaceTransaction, signedTransaction)
      // status
      this._loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
        .subscribe(
          (response) => console.log(response),
          (error) => reject(error))
    })
  }

  async createMosaic(privateKey: string, maxAmount: number, supplyMutable: boolean, transferable: boolean, divisibility: number, durationCount?: number): Promise<TransactionResult> {
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
        [])
      const signedTransaction = account.sign(aggregateTransaction, this.networkGenerationHash)
      // status
      this._loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('createMosaic', response, mosaicDefinitionTransaction.mosaicId),
            (error) => reject(error))
    })
  }

  async registeNamespaceToAddress(name: string, addr: string, privateKey: string): Promise<TransactionResult> {
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
      // status
      this._loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('registeNamespaceToAddress', addressAliasTransaction, response),
            (error) => reject(error))
    })
  }

  async registeMosaicToNamespace(name: string, mosaicName: string, privateKey: string): Promise<TransactionResult> {
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
      // status
      this._loadStatus(account.address.plain(), signedTransaction.hash)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
      // transactionHttp
      this.transactionHttp.announce(signedTransaction)
          .subscribe(
            (response) => console.log('registeMosaicToNamespace', response),
            (error) => reject(error))
    })
  }
  private _loadStatus(addr: string, hash: string): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
      this.listener.open().then(() => {
        this.listener.status(address)
          .pipe(
            filter((item) => item.hash === hash),
            map((item) => new TransactionError(item.status, item.hash)),
          ).subscribe((response) => {
            console.error('loadStatus status', response)
            reject(response)
          })
        this.listener.unconfirmedAdded(address)
          .pipe(
            filter((item) => (item.transactionInfo !== undefined && item.transactionInfo.hash === hash)),
            map((item) => new TransactionResult('SUCCESS', item.transactionInfo!.hash!)),
          ).subscribe((response) => {
            console.log('loadStatus unconfirmedAdded' , response)
            resolve(response)
        })
      })
    })
  }

  private _transactionHistory(publicAccount: PublicAccount, query: QueryParams): Promise<TransactionHistory[]> {
    return new Promise((resolve, reject) => {
      let transactions: TransferTransaction[] = []
      this.accountHttp.transactions(publicAccount, query)
        .pipe(
          map((item) => {
            if (item.length === 0) {
              resolve([])
            }
            return item
          }),
          mergeMap((items) => transactions = items.filter((item) => item instanceof TransferTransaction)
            .map((item) => item as TransferTransaction)
            .filter((item) => item.transactionInfo !== undefined && item.transactionInfo instanceof TransactionInfo)),
          map((item) =>  this.blockHttp.getBlockByHeight(item.transactionInfo!.height.compact())),
          combineAll(),
          map((blocks) => {
            return transactions.map((item) => {
              const targetBlock = blocks.filter((block) => block.height.compact() === item.transactionInfo!.height.compact())[0]
              return new TransactionHistory(
                item.transactionInfo!.id,
                item.mosaics.length !== 0 ? item.mosaics[0].amount.compact() / NemHelper.divisibility() : 0,  // ココ暫定. 後回し.
                item.maxFee.compact(),
                item.recipient instanceof Address ? item.recipient.plain() : '',
                item.signer !== undefined ? item.signer!.address.plain() : '',
                item.message.payload,
                targetBlock !== undefined ? new Date(targetBlock.timestamp.compact() + Date.UTC(2016, 3, 1, 0, 0, 0, 0)) : undefined,
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
