import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'

export interface FetchLoadTransactionHistoryUseCase {
  execute(limit: number, id?: string): Promise<TransactionHistory[]>
}

export class FetchLoadTransactionHistoryUseCaseImpl implements FetchLoadTransactionHistoryUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
  }

  async execute(limit: number, id?: string) {
    try {
      const wallet = await this.walletRepository.loadWallet()
      const publicKey = wallet!.publicKey!
      return await this.transactionRepository.transactionHistory(publicKey, limit, id)
    } catch (error) {
      throw error
    }
  }
}

