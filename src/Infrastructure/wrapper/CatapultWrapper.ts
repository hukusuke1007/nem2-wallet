import { Account, NetworkType } from 'nem2-sdk'
import encoding from 'encoding-japanese'
import { BlockchainWrapper } from '@/infrastructure/wrapper/BlockchainWrapper'
import { Wallet } from '@/domain/entity/Wallet'

export class CatapultWrapper implements BlockchainWrapper {
  static qrJson(v: number, type: number, name: string, addr: string, amount: number, msg: string) {
    const params = { type, data: { name, addr, amount: amount * this.divisibility(), msg }, v }
    return encoding.codeToString(encoding.convert(this.getStr2Array(JSON.stringify(params)), 'UTF8'))
  }

  static divisibility(): number {
    return Math.pow(10, 6)
  }

  private static getStr2Array(str: string) {
    const array = []
    for (let i = 0; i < str.length; i++) {
      array.push(str.charCodeAt(i))
    }
    return array
  }

  endpoint: string
  host: string
  port: string
  network: number

  constructor(host: string, port: string, network: number) {
    this.host = host
    this.port = port
    this.network = network
    this.endpoint = ''
    console.log(this.host, this.port, this.network)
  }

  createAccount(): Wallet {
    const account = Account.generateNewAccount(this.network)
    console.log('createAccount', account)
    const result = new Wallet()
    result.address = account.address.plain()
    result.privateKey = account.privateKey
    result.publicKey = account.publicKey
    result.networkType = account.address.networkType.valueOf()
    return result
  }

  async loadAccount(address: string) {
    return {}
  }

  async sendCoin() {
    
  }

  async sendAsset() {

  }

}
