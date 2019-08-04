export enum TransactionConfirmType {
  Unconfirm = 0,
  Confirm,
}

export class TransactionResult {
  message: string
  hash?: string
  confirmType?: TransactionConfirmType
  constructor(message: string, hash?: string, confirmType?: TransactionConfirmType) {
    this.message = message
    this.hash = hash
    this.confirmType = confirmType
  }
}
