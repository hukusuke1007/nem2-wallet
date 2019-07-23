export class TransactionHistory {
  id: string
  amount: number
  fee: number
  toAddress: string
  fromAddress: string
  message: string
  date?: Date
  hash?: string
  rawValue?: any

  constructor(id: string, amount: number, fee: number, toAddress: string, fromAddress: string, message: string, date?: Date, hash?: string, rawValue?: any) {
    this.id = id
    this.amount = amount
    this.fee = fee
    this.toAddress = toAddress
    this.fromAddress = fromAddress
    this.message = message
    this.date = date
    this.hash = hash
    this.rawValue = rawValue
  }
}
