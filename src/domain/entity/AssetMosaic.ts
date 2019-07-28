export class AssetMosaic {
  mosaicId: string
  namespace?: string
  relativeAmount: number
  divisibility: number
  rawValue: any

  constructor(mosaicId: string, relativeAmount: number, divisibility: number, rawValue: any, namespace?: string) {
    this.mosaicId = mosaicId
    this.relativeAmount = relativeAmount
    this.divisibility = divisibility
    this.rawValue = rawValue
    this.namespace = namespace
  }

}
