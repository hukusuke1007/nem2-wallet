export class Wallet {
  balance: number
  address?: string
  publicKey?: string
  privateKey?: string
  networkType: number

  constructor() {
    this.balance = 0
    this.address = undefined
    this.publicKey = undefined
    this.privateKey = undefined
    this.networkType = 0
  }

  toJSON(): any {
    return {
      address: this.address,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      networkType: this.networkType,
    }
  }
}
