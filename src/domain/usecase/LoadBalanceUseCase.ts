import { WalletRepository } from '@/domain/repository/WalletRepository'
import { NamespaceRepository } from '@/domain/repository/NamespaceRepository'
import { AssetMosaic } from '@/domain/entity/AssetMosaic'

export interface LoadBalanceUseCase {
  execute(addr: string): Promise<AssetMosaic[]>
}

export class LoadBalanceUseCaseImpl implements LoadBalanceUseCase {
  private walletRepository: WalletRepository
  private namespaceRepository: NamespaceRepository
  constructor(walletRepository: WalletRepository, namespaceRepository: NamespaceRepository) {
    this.walletRepository = walletRepository
    this.namespaceRepository = namespaceRepository
  }

  async execute(addr: string) {
    try {
      return await this.walletRepository.loadBalance(addr)
    } catch (error) {
      throw error
    }
  }
}

