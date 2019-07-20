/** UseCase */
import { FetchLoadBalanceUseCaseImpl } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCaseImpl } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCaseImpl } from '@/domain/usecase/FetchSendCoinUseCase'
import { FetchLoadTransactionHistoryUseCaseImpl } from '@/domain/usecase/FetchLoadTransactionHistoryUseCase'
import { FetchAssetExchangeUseCaseImpl } from '@/domain/usecase/FetchAssetExchangeUseCase'


/** DataSource */
import { WalletDataSource } from '@/infrastructure/datasource/WalletDataSource'
import { TransactionDataSource } from '@/infrastructure/datasource/TransactionDataSource'
import { CatapultWrapper } from '@/infrastructure/wrapper/CatapultWrapper'

const host = process.env.NODE_HOST
const ws = process.env.NODE_WS
const port = process.env.NODE_PORT
const network: number = Number(process.env.NETWORK)
const generateHash = process.env.NETWORK_GENERATION_HASH
const blockchainWrapper = new CatapultWrapper(host, ws, port, network, generateHash)
const walletDataSource = new WalletDataSource(blockchainWrapper)
const transactionDataSource = new TransactionDataSource(blockchainWrapper)

export const provide = {
  FetchLoadBalanceUseCase: new FetchLoadBalanceUseCaseImpl(walletDataSource),
  FetchLoadWalletUseCase: new FetchLoadWalletUseCaseImpl(walletDataSource),
  FetchSendCoinUseCase: new FetchSendCoinUseCaseImpl(transactionDataSource, walletDataSource),
  FetchLoadTransactionHistoryUseCase: new FetchLoadTransactionHistoryUseCaseImpl(transactionDataSource, walletDataSource),
  FetchAssetExchangeUseCase: new FetchAssetExchangeUseCaseImpl(transactionDataSource, walletDataSource),
}
