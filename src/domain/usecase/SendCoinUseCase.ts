import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { WalletRepository } from '@/domain/repository/WalletRepository'
import { TransactionResult } from '@/domain/entity/TransactionResult'
import { SendAsset } from '@/domain/entity/SendAsset'

export interface SendCoinUseCase {
  execute(asset: SendAsset): Promise<TransactionResult>
}

export class SendCoinUseCaseImpl implements SendCoinUseCase {
  private transactionRepository: TransactionRepository
  private walletRepository: WalletRepository

  constructor(transactionRepository: TransactionRepository, walletRepository: WalletRepository) {
    this.transactionRepository = transactionRepository
    this.walletRepository = walletRepository
  }

  async execute(asset: SendAsset) {
    try {
      const wallet = await this.walletRepository.loadWallet()
      const privateKey = wallet!.privateKey!
      return await this.transactionRepository.sendAsset(privateKey, asset)
    } catch (error) {
      throw error
    }
  }
}
