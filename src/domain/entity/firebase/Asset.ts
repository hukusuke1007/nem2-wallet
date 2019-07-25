import { Doc, Field } from '@1amageek/ballcap'

export class Asset extends Doc {
  static collectionName = 'asset'
  static modelName(): string {
    return Asset.collectionName
  }

  @Field uid?: string
  @Field namespace?: string
  @Field mosaicId?: string
  @Field exchangeAmount?: number
  @Field creatorAddress?: string
  @Field creatorPublicKey?: string

  modelName(): string {
    return Asset.collectionName
  }
}
