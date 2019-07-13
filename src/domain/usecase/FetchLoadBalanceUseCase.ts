import { WalletRepository } from '@/domain/repository/WalletRepository'

export interface FetchLoadBalanceUseCase {
  execute(): Promise<number>
}

export class FetchLoadBalanceUseCaseImpl implements FetchLoadBalanceUseCase {
  private repository: WalletRepository
  constructor(repository: WalletRepository) {
    this.repository = repository
  }

  async execute(): Promise<number> {
    return this.repository.loadBalance()
  }
}

