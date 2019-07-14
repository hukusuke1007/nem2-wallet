
export interface TransactionRepository {
  sendAsset(privateKey: string, toAddress: string, amount: number, message?: string): Promise<any>
}
