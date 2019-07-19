import { TransactionRepository } from '@/domain/repository/TransactionRepository'
import { NemBlockchainWrapper } from '@/infrastructure/wrapper/NemBlockchainWrapper'
import { AssetCreation } from '@/domain/entity/AssetCreation'

export class TransactionDataSource implements TransactionRepository {
  private wrapper: NemBlockchainWrapper

  constructor(wrapper: NemBlockchainWrapper) {
    this.wrapper = wrapper
  }

  async sendAsset(privateKey: string, toAddress: string, amount: number, message: string) {
    try {
      return await this.wrapper.sendAsset(privateKey, toAddress, amount, message)
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

  async checkNamespace(name: string) {
    try {
      return await this.wrapper.checkNamespace(name)
    } catch (error) {
      throw error
    }
  }

  async createNamespace(name: string, privateKey: string) {
    try {
      return await this.wrapper.createNamespace(name, privateKey)
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

  async registeNamespaceToAddress(name: string, addr: string, privateKey: string) {
    try {
      return await this.wrapper.registeNamespaceToAddress(name, addr, privateKey)
    } catch (error) {
      throw error
    }
  }

  async registeMosaicToNamespace(name: string, mosaicId: string, privateKey: string) {
    try {
      return await this.wrapper.registeMosaicToNamespace(name, mosaicId, privateKey)
    } catch (error) {
      throw error
    }
  }
}
