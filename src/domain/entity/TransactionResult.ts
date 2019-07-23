export class TransactionResult {
  message: string
  hash?: string

  constructor(message: string, hash?: string) {
    this.message = message
    this.hash = hash
  }
}
