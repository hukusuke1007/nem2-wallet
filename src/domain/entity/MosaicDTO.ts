export class MosaicDTO {
  mosaicId: string
  divisibility: number
  constructor(mosaicId: string, divisibility: number) {
    this.mosaicId = mosaicId
    this.divisibility = divisibility
  }
}
