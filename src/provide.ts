/** DataSource */
import { WalletDataSource } from '@/Infrastructure/datasource/WalletDataSource'
import { TransactionDataSource } from '@/Infrastructure/datasource/TransactionDataSource'

/** UseCase */
import { FetchLoadBalanceUseCaseImpl } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCaseImpl } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCaseImpl } from '@/domain/usecase/FetchSendCoinUseCase'

const walletDataSource = new WalletDataSource()
const transactionDataSource = new TransactionDataSource()

export const provide = {
  FetchLoadBalanceUseCase: new FetchLoadBalanceUseCaseImpl(walletDataSource),
  FetchLoadWalletUseCase: new FetchLoadWalletUseCaseImpl(walletDataSource),
  FetchSendCoinUseCase: new FetchSendCoinUseCaseImpl(transactionDataSource),
}
