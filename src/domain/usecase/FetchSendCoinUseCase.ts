import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { SendAssetResult } from '@/domain/entity/SendAssetResult'

export interface FetchSendCoinUseCase {
  execute(address: string, amount: number, message: string): Promise<SendAssetResult>
}

export class FetchSendCoinUseCaseImpl implements FetchSendCoinUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
  }

  async execute(address: string, amount: number, message?: string) {
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      return await this.transactionRepository.sendAsset(privateKey, address, amount, message)
    } catch (error) {
      throw error
    }
  }
}
