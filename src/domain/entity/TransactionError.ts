export class TransactionError {
  message: string
  hash: string

  constructor(message: string, hash: string) {
    this.message = message
    this.hash = hash
  }
}
