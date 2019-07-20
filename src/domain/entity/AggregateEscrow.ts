export class AggregateEscrow {
  receiverPrivateKey: string
  sendAmount: number
  distributorPublicKey: string
  mosaicAmount: number
  mosaicName: string
  mosaicNamespaceName: string

  constructor(receiverPrivateKey: string, sendAmount: number, distributorPublicKey: string, mosaicAmount: number, mosaicName: string, mosaicNamespaceName: string) {
    this.receiverPrivateKey = receiverPrivateKey
    this.sendAmount = sendAmount
    this.distributorPublicKey = distributorPublicKey
    this.mosaicAmount = mosaicAmount
    this.mosaicName = mosaicName
    this.mosaicNamespaceName = mosaicNamespaceName
  }
}
