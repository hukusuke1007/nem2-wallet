import { TransactionRepository } from '@/domain/repository/TransactionRepository'

export interface FetchSendCoinUseCase {
  execute(address: string, amount: number, message: string): Promise<any>
}

export class FetchSendCoinUseCaseImpl implements FetchSendCoinUseCase {
  private repository: TransactionRepository
  constructor(repository: TransactionRepository) {
    this.repository = repository
  }

  async execute(address: string, amount: number, message: string): Promise<any> {
    return this.repository.sendCoin(address, amount, message)
  }
}
