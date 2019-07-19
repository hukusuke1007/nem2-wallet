<template>
  <div class="assetexchangepage">
    <v-flex xs12 sm6 offset-sm3>
      <v-flex>
        <div style="margin: 8px;"> 
          <h2>Asset exchange</h2>
        </div>
      </v-flex>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { format } from 'date-fns'
import { FetchAssetExchangeUseCase } from '@/domain/usecase/FetchAssetExchangeUseCase'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { NemHelper } from '@/domain/helper/NemHelper'

@Component({
  name: 'AssetExchangePage',
  computed: mapState(['isLoading']),
	filters: {
		dateFormat(date: Date) {
			return format(date, 'YYYY/MM/DD HH:mm:ss')
    },
	},
})
export default class AssetExchangePage extends Vue {
  @Inject('FetchAssetExchangeUseCase') fetchAssetExchangeUseCase!: FetchAssetExchangeUseCase

  mounted() {
    this.configure()
  }

  async configure() {
    this.testtest()
  }

  async testtest() {
    try {
      const assetName = 'ticket'
      const maxAmount = 10000
      const supplyMutable = true
      const transferable = true
      const divisibility = 0
      const asset = new AssetCreation(assetName, maxAmount, supplyMutable, transferable, divisibility)
      await this.fetchAssetExchangeUseCase.createAsset(asset)
    } catch (error) {
      console.error('testtest', error)
    }
  }

}
</script>
<style lang="stylus" scoped>
.assetexchangepage
  word-break break-all

.errorLabel
  color red

.table
  &__list
    margin 0 auto
  &__key
    font-size 16px
    text-align center
    padding 8px
  &__value
    font-size 16px
    text-align right
    padding 8px

</style>