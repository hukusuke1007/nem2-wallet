import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { BlockchainWrapper } from '@/infrastructure/wrapper/BlockchainWrapper'

export class TransactionDataSource implements TransactionRepository {
  private wrapper: BlockchainWrapper

  constructor(wrapper: BlockchainWrapper) {
    this.wrapper = wrapper
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message: string): Promise<any> {
    try {
      return await this.wrapper.sendAsset(privateKey, toAddress, amount, message)
    } catch (error) {
      throw error
    }
  }
}
