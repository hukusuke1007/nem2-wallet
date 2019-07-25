import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { AggregateEscrow } from '@/domain/entity/AggregateEscrow'

export class TransactionDataSource implements TransactionRepository {
  private wrapper: NemBlockchainWrapper

  constructor(wrapper: NemBlockchainWrapper) {
    this.wrapper = wrapper
  }

  async loadStatus(addr: string) {
    // try {
    //   return await this.wrapper.loadStatus(addr)
    // } catch (error) {
    //   throw error
    // }
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message: string) {
    try {
      return await this.wrapper.sendAsset(privateKey, toAddress, amount, message)
    } catch (error) {
      throw error
    }
  }

  async requestAggregateEscrowAsset(dto: AggregateEscrow) {
    try {
      return await this.wrapper.requestAggregateEscrowAsset(dto.receiverPrivateKey, dto.sendAmount, dto.distributorPublicKey, dto.mosaicAmount, dto.mosaicName, dto.mosaicNamespaceName)
    } catch (error) {
      throw error
    }
  }

  async consigAggregate(privateKey: string) {
    try {
      return await this.wrapper.consigAggregate(privateKey)
    } catch (error) {
      throw error
    }
  }

  async transactionHistory(id: string) {
    try {
      return await this.wrapper.transactionHistory(id)
    } catch (error) {
      throw error
    }
  }

  async transactionHistoryAll(publicKey: string, limit: number, id?: string) {
    try {
      return await this.wrapper.transactionHistoryAll(publicKey, limit, id)
    } catch (error) {
      throw error
    }
  }

  async unconfirmedTransactions(publicKey: string, limit: number, id?: string) {
    try {
      return await this.wrapper.unconfirmedTransactions(publicKey, limit, id)
    } catch (error) {
      throw error
    }
  }

  async aggregateBondedTransactions(publicKey: string, limit: number, id?: string) {
    try {
      return await this.wrapper.aggregateBondedTransactions(publicKey, limit, id)
    } catch (error) {
      throw error
    }
  }

  async loadNamespace(name: string) {
    try {
      return await this.wrapper.loadNamespace(name)
    } catch (error) {
      if (this._errorNotFound(error)) {
        return undefined
      } else {
        throw error
      }
    }
  }

  async createNamespace(name: string, privateKey: string, rentalBlock: number) {
    try {
      return await this.wrapper.createNamespace(name, privateKey, rentalBlock)
    } catch (error) {
      throw error
    }
  }

  async createSubNamespace(subName: string, rootName: string, privateKey: string) {
    try {
      return await this.wrapper.createSubNamespace(subName, rootName, privateKey)
    } catch (error) {
      throw error
    }
  }

  async createMosaic(privateKey: string, asset: AssetCreation) {
    try {
      return await this.wrapper.createMosaic(privateKey, asset.maxAmount, asset.supplyMutable, asset.transferable, asset.divisibility, asset.durationCount)
    } catch (error) {
      throw error
    }
  }

  async registNamespaceToAddress(name: string, addr: string, privateKey: string) {
    try {
      return await this.wrapper.registNamespaceToAddress(name, addr, privateKey)
    } catch (error) {
      throw error
    }
  }

  async registMosaicToNamespace(name: string, mosaicId: string, privateKey: string) {
    try {
      return await this.wrapper.registMosaicToNamespace(name, mosaicId, privateKey)
    } catch (error) {
      throw error
    }
  }

  private _errorNotFound(error: any) {
    return 'statusCode' in error && error.statusCode === 404 ? true : false
  }
}
