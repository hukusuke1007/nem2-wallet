import { AccountHttp, MosaicHttp, MosaicService, Account, Address,
   TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage, TransactionHttp } from 'nem2-sdk'
import { BlockchainWrapper } from '@/infrastructure/wrapper/BlockchainWrapper'
import { Wallet } from '@/domain/entity/Wallet'
import { mergeMap } from 'rxjs/operators'

export class CatapultWrapper implements BlockchainWrapper {

  endpoint: string
  host: string
  port: string
  network: number
  networkGenerationHash: string
  accountHttp: AccountHttp
  mosaicHttp: MosaicHttp
  transactionHttp: TransactionHttp
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
    console.log(this.host, this.port, this.network, this.endpoint, this.networkGenerationHash)
  }

  createAccount(): Wallet {
    const account = Account.generateNewAccount(this.network)
    console.log('createAccount', account)
    const result = new Wallet()
    result.address = account.address.plain()
    result.privateKey = account.privateKey
    result.publicKey = account.publicKey
    result.networkType = account.address.networkType.valueOf()
    return result
  }

  async loadBalance(addr: string) {
    const address = Address.createFromRawAddress(addr)
    return new Promise((resolve, reject) => {
      this.mosaicService.mosaicsAmountViewFromAddress(address)
        .pipe(
          mergeMap((_) => _ ),
        ).subscribe(
          (mosaic) => resolve(mosaic.relativeAmount()),
          (error) => reject(error),
        )
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
    // console.log('transferTransaction', transferTransaction)
    const account = Account.createFromPrivateKey(privateKey, this.network)
    const signedTransaction = account.sign(transferTransaction, this.networkGenerationHash)
    // console.log('signedTransaction', signedTransaction)
    return new Promise((resolve, reject) => {
      this.transactionHttp
      .announce(signedTransaction)
      .subscribe(
        (response) => resolve(response),
        (error) => reject(error),
      )
    })
  }

}
