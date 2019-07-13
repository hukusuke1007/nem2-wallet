
export interface TransactionRepository {
  sendCoin(address: string, privateKey: string, amount: number, message: string): Promise<any>
}
