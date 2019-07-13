import { WalletRepository } from '@/domain/repository/WalletRepository'
import { Wallet } from '@/domain/entity/Wallet'
import localForage from 'localforage'

// 実装中
export class WalletDataSource implements WalletRepository {

  private localStorageKey: string

  constructor() {
    this.localStorageKey = 'nem2-wallet'
  }

  createWallet(): Wallet {
    console.log('createWallet')
    return new Wallet()
  }

  loadWallet(): Wallet | undefined {
    console.log('loadWallet')
    return undefined
  }

  async loadBalance(): Promise<number> {
    console.log('loadBalance')
    return 0
  }
}
