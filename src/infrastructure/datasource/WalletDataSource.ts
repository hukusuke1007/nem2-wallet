import localForage from 'localforage'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'
import { Wallet } from '@/domain/entity/Wallet'

export class WalletDataSource implements WalletRepository {

  private wrapper: NemBlockchainWrapper
  private localStorageKey: string

  constructor(wrapper: NemBlockchainWrapper) {
    this.wrapper = wrapper
    this.localStorageKey = 'nem2-wallet'
  }

  async createWallet() {
    const wallet = this.wrapper.createAccount()
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

  async loadAccount(addr: string) {
    try {
      return await this.wrapper.loadAccount(addr)
    } catch (error) {
      throw error
    }
  }

  async loadBalance(addr: string) {
    try {
      return await this.wrapper.loadBalance(addr)
    } catch (error) {
      throw error
    }
  }

  async loadNamespacesFromAccount(addr: string) {
    try {
      return await this.wrapper.loadNamespacesFromAccount(addr)
    } catch (error) {
      throw error
    }
  }
}
