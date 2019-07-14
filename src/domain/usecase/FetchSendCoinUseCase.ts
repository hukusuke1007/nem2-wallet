import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'

export interface FetchSendCoinUseCase {
  execute(address: string, amount: number, message: string): Promise<any>
}

export class FetchSendCoinUseCaseImpl implements FetchSendCoinUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
  }

  async execute(address: string, amount: number, message?: string): Promise<any> {
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      return await this.transactionRepository.sendAsset(privateKey, address, amount, message)
    } catch (error) {
      throw error
    }
  }
}
