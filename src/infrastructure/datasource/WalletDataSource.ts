import { AccountHttp, MosaicHttp, MosaicService, Account, Address } from 'nem2-sdk'
import localForage from 'localforage'
import { mergeMap } from 'rxjs/operators'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { Wallet } from '@/domain/entity/Wallet'
import { NemNode } from '@/domain/configure/NemNode'

export class WalletDataSource implements WalletRepository {
  nemNode: NemNode
  private accountHttp: AccountHttp
  private mosaicHttp: MosaicHttp
  private mosaicService: MosaicService
  private localStorageKey: string

  constructor(nemNode: NemNode) {
    this.nemNode = nemNode
    this.accountHttp = new AccountHttp(nemNode.endpoint)
    this.mosaicHttp = new MosaicHttp(nemNode.endpoint)
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp)
    this.localStorageKey = 'nem2-wallet'
  }

  async createWallet() {
    const account = Account.generateNewAccount(this.nemNode.network)
    const wallet = new Wallet(
      account.address.plain(),
      account.publicKey,
      account.privateKey,
      account.address.networkType.valueOf(),
    )
    await localForage.setItem(this.localStorageKey, wallet.toJSON())
    return wallet
  }

  async loadWallet() {
    const item: any = await localForage.getItem(this.localStorageKey)
    console.log('loadWallet', item)
    if (item !== null) {
      return new Wallet(
        'address' in item ? item.address : undefined,
        'publicKey' in item ? item.publicKey : undefined,
        'privateKey' in item ? item.privateKey : undefined,
        'networkType' in item ? item.networkType : undefined,
      )
    } else {
      return undefined
    }
  }

  async loadAccount(addr: string): Promise<any> {
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
}
