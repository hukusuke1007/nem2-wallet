export class AssetCreation {
  namespace: string
  maxAmount: number
  supplyMutable: boolean
  transferable: boolean
  divisibility: number
  durationCount?: number

  constructor(namespace: string, maxAmount: number, supplyMutable: boolean, transferable: boolean, divisibility: number, durationCount?: number) {
    this.namespace = namespace
    this.maxAmount = maxAmount
    this.supplyMutable = supplyMutable
    this.transferable = transferable
    this.divisibility = divisibility
    this.durationCount = durationCount
  }
}
