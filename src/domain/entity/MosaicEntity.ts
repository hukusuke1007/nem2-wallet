export class MosaicEntity {
  mosaicId: string
  ownerAddress: string
  ownerPublicKey: string
  divisibility: number
  hash?: string
  constructor(mosaicId: string, ownerAddress: string, ownerPublicKey: string, divisibility: number, hash?: string) {
    this.mosaicId = mosaicId
    this.ownerAddress = ownerAddress
    this.ownerPublicKey = ownerPublicKey
    this.divisibility = divisibility
    this.hash = hash
  }
}
