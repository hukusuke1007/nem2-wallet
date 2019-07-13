export class Wallet {
  balance: number
  address?: string
  publicKey?: string
  privateKey?: string

  constructor() {
    this.balance = 0
    this.address = undefined
    this.publicKey = undefined
    this.privateKey = undefined
  }
}
