export class MosaicAggregate {
  mosaicId: string
  aggregate: any
  constructor(mosaicId: string, aggregate: any) {
    this.mosaicId = mosaicId
    this.aggregate = aggregate
  }
}
