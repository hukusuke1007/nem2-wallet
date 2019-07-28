export class SendAsset {
  address: string
  divisibility: number
  mosaicId: string
  message?: string
  relativeAmount: number

  constructor() {
    this.address = ''
    this.mosaicId = ''
    this.message = undefined
    this.relativeAmount = 0
    this.divisibility = 6
  }

  clear() {
    this.address = ''
    this.message = undefined
    this.relativeAmount = 0
  }

  getRawAmount() {
    return this.relativeAmount * Math.pow(10, this.divisibility)
  }
}
