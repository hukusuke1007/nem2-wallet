import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'

export class TransactionDataSource implements TransactionRepository {
  private wrapper: NemBlockchainWrapper

  constructor(wrapper: NemBlockchainWrapper) {
    this.wrapper = wrapper
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message: string) {
    try {
      return await this.wrapper.sendAsset(privateKey, toAddress, amount, message)
    } catch (error) {
      throw error
    }
  }

  async transactionHistory(publicKey: string, limit: number, id?: string) {
    try {
      return await this.wrapper.transactionHistory(publicKey, limit, id)
    } catch (error) {
      throw error
    }
  }
}
