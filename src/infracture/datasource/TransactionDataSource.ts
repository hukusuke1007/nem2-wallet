import { TransactionRepository } from '@/domain/repository/TransactionRepository'

// 実装中
export class TransactionDataSource implements TransactionRepository {
  async sendCoin(address: string, privateKey: string, amount: number, message: string): Promise<any> {
    return undefined
  }
}
