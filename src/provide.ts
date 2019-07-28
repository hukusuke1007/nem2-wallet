/** UseCase */
import { LoadBalanceUseCaseImpl } from '@/domain/usecase/LoadBalanceUseCase'
import { LoadWalletUseCaseImpl } from '@/domain/usecase/LoadWalletUseCase'
import { SendCoinUseCaseImpl } from '@/domain/usecase/SendCoinUseCase'
import { LoadTransactionHistoryUseCaseImpl } from '@/domain/usecase/LoadTransactionHistoryUseCase'
import { AssetExchangeUseCaseImpl } from '@/domain/usecase/AssetExchangeUseCase'

/** DataSource */
import { WalletDataSource } from '@/infrastructure/datasource/WalletDataSource'
import { TransactionDataSource } from '@/infrastructure/datasource/TransactionDataSource'
import { AggregateTransactionDataSource } from '@/infrastructure/datasource/AggregateTransactionDataSource'
import { MosaicDataSource } from '@/infrastructure/datasource/MosaicDataSource'
import { NamespaceDataSource } from '@/infrastructure/datasource/NamespaceDataSource'

/** Configure */
import { NemNode } from '@/domain/configure/NemNode'

const host = process.env.NODE_HOST
const ws = process.env.NODE_WS
const port = process.env.NODE_PORT
const network: number = Number(process.env.NETWORK)
const generateHash = process.env.NETWORK_GENERATION_HASH
const nemNode = new NemNode(host, ws, port, network, generateHash)

const walletDataSource = new WalletDataSource(nemNode)
const transactionDataSource = new TransactionDataSource(nemNode)
const aggregateTransactionDataSource = new AggregateTransactionDataSource(nemNode)
const mosaicDataSource = new MosaicDataSource(nemNode)
const namespaceDataSource = new NamespaceDataSource(nemNode)

export const provide = {
  LoadBalanceUseCase: new LoadBalanceUseCaseImpl(walletDataSource, namespaceDataSource),
  LoadWalletUseCase: new LoadWalletUseCaseImpl(walletDataSource),
  SendCoinUseCase: new SendCoinUseCaseImpl(transactionDataSource, walletDataSource),
  LoadTransactionHistoryUseCase: new LoadTransactionHistoryUseCaseImpl(transactionDataSource, walletDataSource),
  AssetExchangeUseCase: new AssetExchangeUseCaseImpl(transactionDataSource, walletDataSource, aggregateTransactionDataSource, mosaicDataSource, namespaceDataSource),
}
