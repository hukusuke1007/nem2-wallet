import { AccountHttp, MosaicHttp, MosaicService, Account, Address,
   TransferTransaction, Deadline, NetworkCurrencyMosaic, PlainMessage, TransactionHttp,
   PublicAccount, QueryParams, TransactionInfo } from 'nem2-sdk'
import { mergeMap, map } from 'rxjs/operators'
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

  createAccount() {
    const account = Account.generateNewAccount(this.network)
    return new Wallet(
      account.address.plain(),
      account.publicKey,
      account.privateKey,
      account.address.networkType.valueOf(),
    )
  }

  async loadBalance(addr: string) {
    const address = Address.createFromRawAddress(addr)
    return new Promise((resolve, reject) => {
      this.mosaicService.mosaicsAmountViewFromAddress(address)
        .pipe(
          mergeMap((_) => _ ),
        ).subscribe(
          (mosaic) => resolve(mosaic.relativeAmount()),
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

  async transactionHistory(publicKey: string, limit: number, id?: string) {
    const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.network)
    return new Promise((resolve, reject) => {
      this.accountHttp.transactions(publicAccount, new QueryParams(limit, id))
        .pipe(
          map((items) => items.filter((item) => item instanceof TransferTransaction)
            .map((item) => item as TransferTransaction)
            .filter((item) => item.transactionInfo !== undefined && item.transactionInfo instanceof TransactionInfo)
            .map((item) => new TransactionHistory(
              item.transactionInfo!.id,
              item.mosaics.length !== 0 ? item.mosaics[0].amount.compact() / NemHelper.divisibility() : 0,  // ココ暫定. 後回し.
              item.maxFee.compact(),
              item.recipient instanceof Address ? item.recipient.plain() : '',
              item.signer !== undefined ? item.signer!.address.plain() : '',
              item.message.payload,
              new Date(item.deadline.value.atZone(ZoneId.SYSTEM).toInstant().toEpochMilli()),
              item.transactionInfo!.hash,
              item,
            ))),
        ).subscribe(
          (response) => resolve(response),
          (error) => reject(error))
    })
  }
}
