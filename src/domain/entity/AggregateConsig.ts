export class AggregateConsig {
  distributerCurrency: string
  distributerAmount: number
  distributerAddress: string
  receiverCurrency: string
  receiverAmount: number
  receiverAddress: string
  deadline?: Date
  aggregateTransaction: any
  // constructor(receiveCurrency: string, receiveAmount: number, sendCurrency: string, sendAmount: number, receiverAddress: string, distributerAddress: string, deadline: Date, aggregateTransaction: any) {
  //   this.receiveCurrency = receiveCurrency
  //   this.receiveAmount = receiveAmount
  //   this.sendCurrency = sendCurrency
  //   this.sendAmount = sendAmount
  //   this.receiverAddress = receiverAddress
  //   this.distributerAddress = distributerAddress
  //   this.deadline = deadline
  //   this.aggregateTransaction = aggregateTransaction
  // }
  constructor() {
    this.distributerCurrency = ''
    this.distributerAmount = 0
    this.distributerAddress = ''
    this.receiverCurrency = ''
    this.receiverAmount = 0
    this.receiverAddress = ''
    this.deadline = undefined
    this.aggregateTransaction = undefined
  }
}
