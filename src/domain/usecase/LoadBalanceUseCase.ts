import { WalletRepository } from '@/domain/repository/WalletRepository'
import { AssetMosaic } from '@/domain/entity/AssetMosaic'

export interface LoadBalanceUseCase {
  execute(addr: string): Promise<AssetMosaic[]>
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

