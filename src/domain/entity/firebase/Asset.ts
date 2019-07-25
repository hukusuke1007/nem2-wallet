import { Doc, Field } from '@1amageek/ballcap'

export class Asset extends Doc {
  @Field uid?: string
  @Field namespace?: string
  @Field createAddress?: string
  @Field mosaicId?: string
  @Field exchangeAmount?: number
}
