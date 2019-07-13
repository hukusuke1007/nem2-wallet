import { WalletRepository } from '@/domain/repository/WalletRepository'
import { Wallet } from '@/domain/entity/Wallet'

export interface FetchLoadWalletUseCase {
  execute(): Wallet
}

export class FetchLoadWalletUseCaseImpl implements FetchLoadWalletUseCase {

  private repository: WalletRepository

  constructor(repository: WalletRepository) {
    this.repository = repository
  }

  execute(): Wallet {
    return this.repository.loadWallet() !== undefined ?
      this.repository.loadWallet()! : this.repository.createWallet()
  }
}
