export class TransactionHistory {
  id: string
  amount: number
  fee: number
  toAddress: string
  fromAddress: string
  message: string
  date: Date
  rawValue: any
  hash?: string

  constructor(id: string, amount: number, fee: number, toAddress: string, fromAddress: string, message: string, date: Date, rawValue: any, hash?: string) {
    this.id = id
    this.amount = amount
    this.fee = fee
    this.toAddress = toAddress
    this.fromAddress = fromAddress
    this.message = message
    this.date = date
    this.rawValue = rawValue
    this.hash = hash
  }
}
