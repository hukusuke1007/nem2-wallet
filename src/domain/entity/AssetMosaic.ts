export class AssetMosaic {
  mosaicId: string
  namespace?: string
  amount: number
  rawValue: any

  constructor(mosaicId: string, amount: number, rawValue: any, namespace?: string) {
    this.mosaicId = mosaicId
    this.amount = amount
    this.rawValue = rawValue
    this.namespace = namespace
  }
}
