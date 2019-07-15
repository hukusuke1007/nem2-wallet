export class SendAssetResult {
  hash: string
  message: string

  constructor(hash: string, message: string) {
    this.hash = hash
    this.message = message
  }
}
