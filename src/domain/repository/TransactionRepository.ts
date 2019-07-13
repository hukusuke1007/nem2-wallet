
export interface TransactionRepository {
  sendCoin(address: string, amount: number, message: string): Promise<any>
}
