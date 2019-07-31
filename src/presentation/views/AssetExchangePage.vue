<template>
  <div class="assetexchangepage">
    <v-flex xs12 sm6 offset-sm3>
      <v-flex style="margin-top: 8px;">
        <h1>Asset exchange</h1>
      </v-flex>
      <v-flex style="margin-top: 8px;">
        <v-card>
          <v-card-actions>
            <v-card-title>
              <h4>Asset list</h4>
            </v-card-title>
            <v-spacer />
            <v-btn
              fab
              small
              text
              @click="onLoadAssetList()"
              :loading="isLoading"><v-icon>cached</v-icon></v-btn>
          </v-card-actions>
          <v-flex 
            v-if="assetList.length!==0"
            style="margin: 0 16px;">
            <v-data-table
              :headers="headers"
              :items="assetList"
              :options.sync="pagination"
              hide-default-footer
              no-data-text="">
              <template 
                v-slot:item="props">
                <tr class="asset--list__value" @click="onClickAssetList(props.item)">
                  <td width="40%">{{ props.item.namespace }}</td>
                  <td width="30%">{{ props.item.exchangeAmount }}</td>
                  <td width="40%">{{ props.item.createdAt.toDate() | dateFormat }}</td>
                </tr>
              </template>
            </v-data-table> 
          </v-flex>
          <v-card-actions>
            <v-card-title>
              <h4>Exchange</h4>
            </v-card-title>
          </v-card-actions>
          <v-form style="margin: 0 26px;">
            <v-text-field
              label="asset name"
              v-model="exchangeAssetForm.name"
              placeholder="Asset1"
              disabled />
            <v-text-field
              label="exchange NEM amount"
              v-model="exchangeAssetForm.exchangeNemAmount"
              type="number"
              disabled/>
            <v-text-field
              label="get amount"
              v-model="exchangeAssetForm.amount"
              type="number"
              required />
          </v-form>
          <v-flex style="padding-bottom: 20px;">
            <v-btn
              color="blue"
              class="white--text"
              @click="onExchangeAsset()"
              :loading="isLoading"
              :disabled="isLoading">EXCHANGE</v-btn>
          </v-flex>
        </v-card>
      </v-flex>
      <!-- <v-flex style="margin-top: 16px;">
        <v-card>
          <v-card-actions>
            <v-card-title>
              <h4>Exchange</h4>
            </v-card-title>
          </v-card-actions>
        </v-card>
      </v-flex> -->
      <v-flex style="margin-top: 24px;"> 
        <h1>Create asset</h1>
      </v-flex>
      <v-flex style="margin-top: 8px;">
        <v-card>
          <v-card-actions>
            <v-card-title>
              <h4>Create</h4>
            </v-card-title>
          </v-card-actions>
          <v-form style="margin: 0 26px;">
            <v-text-field
              label="name"
              v-model="assetForm.name"
              placeholder="shohei-ticket"
              required />
            <v-text-field
              label="supply max amount"
              v-model="assetForm.maxAmount"
              type="number"
              required />
            <v-text-field
              label="exchange NEM amount"
              v-model="assetForm.exchangeNemAmount"
              type="number"
              required=""/>
          </v-form>
          <v-flex style="padding-bottom: 20px;">
            <v-btn
              color="blue"
              class="white--text"
              @click="onCreateAsset()"
              :loading="isLoading"
              :disabled="isLoading">CREATE</v-btn>
          </v-flex>
        </v-card>
      </v-flex>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { format } from 'date-fns'
import { AssetExchangeUseCase } from '@/domain/usecase/AssetExchangeUseCase'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { AssetCreation } from '@/domain/entity/AssetCreation'
import { Asset } from '@/domain/entity/firebase/Asset'
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
  @Inject('AssetExchangeUseCase') assetExchangeUseCase!: AssetExchangeUseCase

  // Exchange
  assetList: Asset[] = []
  headers: Array<{ text: string, value: string, align: string }> = [
    { text: 'namespace', value: 'namespace', align: 'center' },
    { text: 'exchange NEM', value: 'exchangeAmount', align: 'center' },
    { text: 'createdAt', value: 'createdAt', align: 'center' },
  ]

  pagination: any = {
    descending: true,
    itemsPerPage: -1,
  }

  // Exchange asset
  exchangeAssetForm: { name: string, assetId: string, amount: number, exchangeNemAmount: number } = { name: '', assetId: '', amount: 0, exchangeNemAmount: 0 }

  // Create asset
  assetForm: { name: string, maxAmount: number, exchangeNemAmount: number } = { name: '', maxAmount: 0, exchangeNemAmount: 0 }

  mounted() {
    this.configure()
  }

  async configure() {
    await this.onLoadAssetList()
  }

  onClickAssetList(item: Asset) {
    console.log('onClickAssetList', item)
    this.setExchangeForm(item)
  }

  async onExchangeAsset() {
    this.$store.commit('startLoading')
    let message: string = ''
    try {
      const assetId = this.exchangeAssetForm.assetId
      const exchangeAsset: Asset = this.assetList.filter((item) => item.mosaicId === assetId)[0]
      const exchangeAmount = Number(this.exchangeAssetForm.exchangeNemAmount)
      const getAmount = Number(this.exchangeAssetForm.amount)
      console.log('onExchangeAsset', exchangeAmount, exchangeAsset.creatorPublicKey!, getAmount, assetId)
      message = await this.assetExchangeUseCase.exchangeAsset(exchangeAmount, exchangeAsset.creatorPublicKey!, getAmount, assetId)
    } catch (error) {
      console.error('onExchangeAsset', error)
      message = error.message
    }
    Vue.prototype.$toast(message)
    this.$store.commit('stopLoading')
  }

  async onCreateAsset() {
    this.$store.commit('startLoading')
    let message: string = ''
    try {
      const assetName = this.assetForm.name
      const maxAmount = Number(this.assetForm.maxAmount)
      const exchangeAmount = Number(this.assetForm.exchangeNemAmount)
      const asset = new AssetCreation(assetName, maxAmount, exchangeAmount, true, true, 0)
      console.log('onCreateAsset', asset)
      message = await this.assetExchangeUseCase.createAsset(asset)
      this.clearForm()
      this.onLoadAssetList()
    } catch (error) {
      console.error('onCreateAsset', error)
      message = error.message
    }
    Vue.prototype.$toast(message)
    this.$store.commit('stopLoading')
  }

  async onLoadAssetList() {
    this.$store.commit('startLoading')
    try {
      this.assetList = await this.assetExchangeUseCase.loadAssetList()
      if (this.assetList.length !== 0) {
        this.setExchangeForm(this.assetList[0])
      }
    } catch (error) {
      console.error('onLoadAssetList', error)
    }
    this.$store.commit('stopLoading')
  }

  setExchangeForm(item: Asset) {
    this.exchangeAssetForm.name = item.namespace!
    this.exchangeAssetForm.assetId = item.mosaicId!
    this.exchangeAssetForm.exchangeNemAmount = item.exchangeAmount!
  }

  clearForm() {
    this.assetForm = { name: '', maxAmount: 0, exchangeNemAmount: 0 }
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

.asset--list
  &__value
    text-align left

.v-data-table th
  text-align center
</style>