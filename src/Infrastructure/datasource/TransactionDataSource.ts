import { TransactionRepository } from '@/domain/repository/TransactionRepository'

export class TransactionDataSource implements TransactionRepository {
  async sendCoin(address: string, amount: number, message: string): Promise<any> {
    return undefined
  }
}
