export class AggregateEscrowDTO {
  receiverPrivateKey: string
  exchangeNemAmount: number
  distributorPublicKey: string
  distributeRawAmount: number
  distributeAssetId: string
  constructor(receiverPrivateKey: string, exchangeNemAmount: number, distributorPublicKey: string, distributeRawAmount: number, distributeAssetId: string) {
    this.receiverPrivateKey = receiverPrivateKey
    this.exchangeNemAmount = exchangeNemAmount
    this.distributorPublicKey = distributorPublicKey
    this.distributeRawAmount = distributeRawAmount
    this.distributeAssetId = distributeAssetId
  }
}
