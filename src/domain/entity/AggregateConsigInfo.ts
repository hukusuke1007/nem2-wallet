import { AggregateConsig } from '@/domain/entity/AggregateConsig'

export class AggregateConsigInfo {
  nextPagingTransactionId?: string
  consigs: AggregateConsig[]
  aggregateTransaction: any
  constructor(nextPagingTransactionId?: string, consigs: AggregateConsig[] = []) {
    this.nextPagingTransactionId = nextPagingTransactionId
    this.consigs = consigs
  }
}
