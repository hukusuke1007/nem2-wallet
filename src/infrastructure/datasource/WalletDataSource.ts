import { AccountHttp, MosaicHttp, MosaicService, Account, Address, MosaicId } from 'nem2-sdk'
import localForage from 'localforage'
import { mergeMap, map, combineAll } from 'rxjs/operators'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { Wallet } from '@/domain/entity/Wallet'
import { AssetMosaic } from '@/domain/entity/AssetMosaic'
import { NemNode } from '@/domain/configure/NemNode'
import { combineLatest } from 'rxjs';

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
    // console.log('loadWallet', item)
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

  async loadBalance(addr: string): Promise<AssetMosaic[]> {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
      this.mosaicService.mosaicsAmountViewFromAddress(address)
        .pipe(
          combineAll(),
          map((items) => items.map((item) => new AssetMosaic(item.fullName(), item.relativeAmount(), item.mosaicInfo.divisibility, item))),
        ).subscribe(
          (items) => resolve(items),
          (error) => reject(error))
    })
  }

  // TODO
  async loadBalanceAndNamespace(addr: string) {
    return new Promise((resolve, reject) => {
      const address = Address.createFromRawAddress(addr)
      this.mosaicService.mosaicsAmountViewFromAddress(address)
        .pipe(
          combineAll(),
          map((items) => {
            const mosaicIds = items.map((item) => item.mosaicInfo.mosaicId)
            console.log('mosaicIds', mosaicIds)
            return this.mosaicHttp.getMosaicsNames(mosaicIds)
          }),
          mergeMap((_) => _),
        ).subscribe(
          (items) =>  {
            console.log(items)
            resolve(items)
          }, (error) => console.error(error))
    })
  }
}
