import { WalletRepository } from '@/domain/repository/WalletRepository'

export interface FetchLoadBalanceUseCase {
  execute(addr: string): Promise<number>
}

export class FetchLoadBalanceUseCaseImpl implements FetchLoadBalanceUseCase {
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

