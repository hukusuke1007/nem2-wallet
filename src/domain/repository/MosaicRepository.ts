import { MosaicEntity } from '@/domain/entity/MosaicEntity'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { MosaicAggregate } from '@/domain/entity/MosaicAggregate'

export interface MosaicRepository {
  loadMosaicInfo(id: string): Promise<MosaicEntity>
  createMosaic(privateKey: string, asset: AssetCreation): Promise<MosaicEntity>
  createMosaicDefinitionTxAggregate(privateKey: string, asset: AssetCreation): MosaicAggregate
  createMosaicSupplyChangeTxAggregate(privateKey: string, mosaicId: string, maxAmount: number): any
}
