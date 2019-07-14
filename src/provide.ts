/** UseCase */
import { FetchLoadBalanceUseCaseImpl } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCaseImpl } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCaseImpl } from '@/domain/usecase/FetchSendCoinUseCase'

/** DataSource */
import { WalletDataSource } from '@/infrastructure/datasource/WalletDataSource'
import { TransactionDataSource } from '@/infrastructure/datasource/TransactionDataSource'
import { CatapultWrapper } from '@/infrastructure/wrapper/CatapultWrapper'

import { NetworkType } from 'nem2-sdk'

const host = ''
const port = ''
const network: number = NetworkType.MIJIN_TEST
const blockchainWrapper = new CatapultWrapper(host, port, network)
const walletDataSource = new WalletDataSource(blockchainWrapper)
const transactionDataSource = new TransactionDataSource()

export const provide = {
  FetchLoadBalanceUseCase: new FetchLoadBalanceUseCaseImpl(walletDataSource),
  FetchLoadWalletUseCase: new FetchLoadWalletUseCaseImpl(walletDataSource),
  FetchSendCoinUseCase: new FetchSendCoinUseCaseImpl(transactionDataSource),
}
