import { WalletRepository } from '@/domain/repository/WalletRepository'
import { Wallet } from '@/domain/entity/Wallet'

export interface LoadWalletUseCase {
  execute(): Promise<Wallet>
}

export class LoadWalletUseCaseImpl implements LoadWalletUseCase {

  private repository: WalletRepository

  constructor(repository: WalletRepository) {
    this.repository = repository
  }

  async execute() {
    const wallet = await this.repository.loadWallet()
    return wallet !== undefined ? wallet : await this.repository.createWallet()
  }
}
