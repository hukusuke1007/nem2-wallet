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
    return new Wallet()
  }
  loadWallet(): Wallet {
    return new Wallet()
  }
  async loadBalance(): Promise<number> {
    return 0
  }
}
