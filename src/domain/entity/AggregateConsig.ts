export class AggregateConsig {
  distributerGetCurrency: string
  distributerGetAmount: number
  distributerAddress: string
  receiverGetCurrency: string
  receiverGetAmount: number
  receiverAddress: string
  deadline?: Date
  aggregateTransaction: any

  constructor() {
    this.distributerGetCurrency = ''
    this.distributerGetAmount = 0
    this.distributerAddress = ''
    this.receiverGetCurrency = ''
    this.receiverGetAmount = 0
    this.receiverAddress = ''
    this.deadline = undefined
    this.aggregateTransaction = undefined
  }
}
