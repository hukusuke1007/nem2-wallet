import { WalletRepository } from '@/domain/repository/WalletRepository'

export interface LoadBalanceUseCase {
  execute(addr: string): Promise<number>
}

export class LoadBalanceUseCaseImpl implements LoadBalanceUseCase {
  private repository: WalletRepository
  constructor(repository: WalletRepository) {
    this.repository = repository
  }

  async execute(addr: string) {
    try {
      return await this.repository.loadBalance(addr)
    } catch (error) {
      throw error
    }
  }
}

