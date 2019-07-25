export class MosaicEntity {
  mosaicId: string
  ownerAddress: string
  ownerPublicKey: string
  hash?: string
  constructor(mosaicId: string, ownerAddress: string, ownerPublicKey: string, hash?: string) {
    this.mosaicId = mosaicId
    this.ownerAddress = ownerAddress
    this.ownerPublicKey = ownerPublicKey
    this.hash = hash
  }
}
