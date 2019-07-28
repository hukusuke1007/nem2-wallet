import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionHistoryInfo } from '@/domain/entity/TransactionHistoryInfo'

export interface LoadTransactionHistoryUseCase {
  executeTransferHistory(id: string): Promise<TransactionHistory>
  executeTransferHistoryAll(limit: number, id?: string): Promise<TransactionHistoryInfo>
}

export class LoadTransactionHistoryUseCaseImpl implements LoadTransactionHistoryUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
  }

  async executeTransferHistory(id: string) {
    try {
      return await this.transactionRepository.transactionHistory(id)
    } catch (error) {
      throw error
    }
  }

  async executeTransferHistoryAll(limit: number, id?: string) {
    try {
      const wallet = await this.walletRepository.loadWallet()
      const publicKey = wallet!.publicKey!
      return await this.transactionRepository.transactionHistoryAll(publicKey, limit, id)
    } catch (error) {
      throw error
    }
  }
}

