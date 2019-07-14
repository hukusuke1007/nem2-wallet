import { WalletRepository } from '@/domain/repository/WalletRepository'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'
import { Wallet } from '@/domain/entity/Wallet'
import localForage from 'localforage'

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
      const result = new Wallet()
      result.address = 'address' in item ? item.address : undefined
      result.privateKey = 'privateKey' in item ? item.privateKey : undefined
      result.publicKey = 'publicKey' in item ? item.publicKey : undefined
      result.networkType = 'networkType' in item ? item.networkType : undefined
      return result
    } else {
      return undefined
    }
  }

  async loadBalance(addr: string) {
    console.log('loadBalance')
    try {
      return await this.wrapper.loadBalance(addr)
    } catch (error) {
      throw error
    }
  }
}
