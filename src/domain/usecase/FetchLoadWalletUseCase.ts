import { WalletRepository } from '@/domain/repository/WalletRepository'
import { Wallet } from '@/domain/entity/Wallet'

export interface FetchLoadWalletUseCase {
  execute(): Promise<Wallet>
}

export class FetchLoadWalletUseCaseImpl implements FetchLoadWalletUseCase {

  private repository: WalletRepository

  constructor(repository: WalletRepository) {
    this.repository = repository
  }

  async execute(): Promise<Wallet> {
    const wallet = await this.repository.loadWallet()
    return wallet !== undefined ? wallet : await this.repository.createWallet()
  }
}
