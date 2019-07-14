export class Wallet {
  balance: number
  address?: string
  publicKey?: string
  privateKey?: string
  networkType?: number

  constructor(address?: string, publicKey?: string, privateKey?: string, networkType?: number) {
    this.balance = 0
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.networkType = networkType
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
