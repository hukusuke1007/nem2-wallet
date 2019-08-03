
export class AssetForm {
  namespace: string
  mosaicId: string
  exchangeAmount: number
  creatorAddress: string
  creatorPublicKey: string
  relativeAmount: number
  createdAt: Date
  constructor(namespace: string, mosaicId: string, exchangeAmount: number, creatorAddress: string, creatorPublicKey: string, relativeAmount: number, createdAt: Date) {
    this.namespace = namespace
    this.mosaicId = mosaicId
    this.exchangeAmount = exchangeAmount
    this.creatorAddress = creatorAddress
    this.creatorPublicKey = creatorPublicKey
    this.relativeAmount = relativeAmount
    this.createdAt = createdAt
  }
}
