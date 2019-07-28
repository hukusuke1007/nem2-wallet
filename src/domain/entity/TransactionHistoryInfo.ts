import { TransactionHistory } from '@/domain/entity/TransactionHistory'

export class TransactionHistoryInfo {
  nextPagingTransactionId?: string
  histories: TransactionHistory[]

  constructor(nextPagingTransactionId?: string, histories: TransactionHistory[] = []) {
    this.nextPagingTransactionId = nextPagingTransactionId
    this.histories = histories
  }
}
