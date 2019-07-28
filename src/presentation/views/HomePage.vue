<template>
  <div>
    <v-flex xs12 sm6 offset-sm3>
      <v-card v-if="wallet!==null">
        <v-container fluid>
          <v-card flat>
            <v-card-actions>
              <v-card-title>
                <h3>Network</h3>
              </v-card-title>
            </v-card-actions>
            <div>
              <table border="1" class="table__list">
                <tr>
                  <td width="15%" class="table__key">net</td>
                  <td width="85%" class="table__value">{{ network.net }}</td>
                </tr>
                <tr>
                  <td width="15%" class="table__key">endpoint</td>
                  <td width="85%" class="table__value">
                    <a :href="network.explorer" target="_blank">{{ network.endpoint }}</a>
                  </td>
                </tr>
                <tr>
                  <td width="15%" class="table__key">faucet</td>
                  <td width="85%" class="table__value">
                    <a :href="network.faucetUrl" target="_blank">{{ network.faucetUrl }}</a>
                  </td>
                </tr>
              </table>
            </div>
            <v-card-actions>
              <v-card-title>
                <h3>Address</h3>
              </v-card-title>
            </v-card-actions>
            <v-card-text style="word-break: break-all;">{{ wallet.address }}</v-card-text>
            <v-card flat>
              <qriously v-model="qrJson" :size=200 />
            </v-card>
            <div>
              <a href="#" @click="() => isShowPrivateKey = !isShowPrivateKey">Show PrivateKey</a>
              <div style="margin: 8px;" v-if="isShowPrivateKey">
                <p style="word-break: break-all;">{{ wallet.privateKey }}</p>
              </div>
            </div>
          </v-card>
          <v-card flat>
            <v-card-actions>
              <v-card-title>
                <h3>Menu</h3>
              </v-card-title>
            </v-card-actions>
            <ul class="menu__list">
              <li>
                <router-link to="./asset_exchange_page">
                  Exchange Asset
                </router-link>
              </li>
            </ul>
          </v-card>          
          <v-card flat>
            <v-card-actions>
              <v-card-title>
                <h3>Balance</h3>
              </v-card-title>
              <v-spacer />
              <v-btn
                fab
                small
                text
                @click="onLoadBalance()"
                :loading="isLoading"><v-icon>cached</v-icon></v-btn>
            </v-card-actions>
            <div v-if="assets.length!==0">
              <v-data-table
                :items="assets"
                hide-default-footer
                no-data-text="">
                <template
                  v-slot:item="props">
                  <tr @click="onClickAsset(props.item)">
                    <td width="50%">{{ props.item.mosaicId }}</td>
                    <td width="50%">{{ props.item.relativeAmount }}</td>
                  </tr>
                </template>
              </v-data-table>
            </div>
            <div v-else>
              <v-card-text>0 xem</v-card-text> 
            </div>
            <v-card-actions>
              <v-card-title>
                <h3>Send</h3>
              </v-card-title>
            </v-card-actions>
            <v-form style="margin: 4px 26px;">
              <v-text-field
                label="currency"
                v-model="sendAsset.mosaicId"
                disabled />
              <v-text-field
                label="address"
                v-model="sendAsset.address"
                required
                placeholder="SADW6WXZVIUWIJ6RAWFSM4F4SJRUBRVOARXXIFSH" />
              <v-text-field
                label="amount"
                v-model="sendAsset.relativeAmount"
                type="number"
                required />
              <v-text-field
                label="message"
                v-model="sendAsset.message"
                placeholder="Hello" />
            </v-form>
            <v-flex>
              <v-btn
                color="blue"
                class="white--text"
                @click="onSend()"
                :loading="isLoading"
                :disabled="isLoading">SEND</v-btn>
            </v-flex>
            <v-flex>
              <v-card-actions>
                <v-card-title>
                  <h3>Result</h3>
                </v-card-title>
              </v-card-actions>
              <div v-for="(item, index) in errorMessages" :key="index">
                <div v-if="item!==true" class="errorLabel">{{ item }}</div>
              </div>
              <p style="word-break: break-all;" v-html="resultMessage"/>
            </v-flex>
            <v-flex>
              <v-card-actions style="word-break: break-all;">
                <v-card-title>
                  <h3>Transaction history</h3>
                </v-card-title>
                {{ transactionHistory.length }}
                <v-spacer />
                <v-btn
                  fab
                  small
                  text
                  @click="onLoadTransactionHistory(true)"
                  :loading="isLoading"><v-icon>cached</v-icon></v-btn>
              </v-card-actions>
              <div style="margin: 4px 20px;">
                <v-data-table
                  :headers="historyHeaders"
                  :items="transactionHistory"
                  :options.sync="pagination"
                  hide-default-footer
                  no-data-text="">
                  <template 
                    v-slot:item="props">
                    <tr @click="onClickHistory(props.item)">
                      <td width="20%">{{ props.item.amount }}</td>
                      <td width="50%">{{ props.item.hash }}</td>
                      <td width="30%">{{ props.item.date | dateFormat }}</td>
                    </tr>
                  </template>
                </v-data-table> 
                <v-btn
                  color="deep-orange lighten-3"
                  class="white--text"
                  @click="onLoadTransactionHistory()"
                  :loading="isLoading"
                  :disabled="isLoading">MORE</v-btn>
              </div>
            </v-flex>
          </v-card>
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { format } from 'date-fns'
import { LoadBalanceUseCase } from '@/domain/usecase/LoadBalanceUseCase'
import { LoadWalletUseCase } from '@/domain/usecase/LoadWalletUseCase'
import { SendCoinUseCase } from '@/domain/usecase/SendCoinUseCase'
import { LoadTransactionHistoryUseCase } from '@/domain/usecase/LoadTransactionHistoryUseCase'
import { Wallet } from '@/domain/entity/Wallet'
import { AssetMosaic } from '@/domain/entity/AssetMosaic'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { TransactionHistoryInfo } from '@/domain/entity/TransactionHistoryInfo'
import { SendAsset } from '@/domain/entity/SendAsset'
import { NemHelper } from '@/domain/helper/NemHelper'
import * as firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  name: 'HomePage',
  computed: mapState(['isLoading']),
	filters: {
		dateFormat(date: Date) {
			return format(date, 'YYYY/MM/DD HH:mm:ss')
    },
	},
})
export default class HomePage extends Vue {
  @Inject('LoadBalanceUseCase') loadBalanceUseCase!: LoadBalanceUseCase
  @Inject('LoadWalletUseCase') loadWalletUseCase!: LoadWalletUseCase
  @Inject('SendCoinUseCase') sendCoinUseCase!: SendCoinUseCase
  @Inject('LoadTransactionHistoryUseCase') loadTransactionHistoryUseCase!: LoadTransactionHistoryUseCase

  balance: number = 0
  assets: AssetMosaic[] = []
  sendAsset: SendAsset = new SendAsset()
  wallet: Wallet | null = null
  qrJson: string = ''

  isShowPrivateKey: boolean = false
  errorMessages: any[] = []
  resultMessage: string = ''

  network: {net: string, endpoint: string, explorer: string, faucetUrl: string} = {
    net: NemHelper.networkLabel(Number(process.env.NETWORK)),
    endpoint: `${process.env.NODE_HOST}:${process.env.NODE_PORT}`,
    explorer: `${process.env.EXPLORER_URL}`,
    faucetUrl: process.env.FAUCET_URL,
  }

  // Balance
  balanceHeaders: Array<{ text: string, value: string, align: string }> = [
    { text: '', value: 'currency', align: 'center' },
    { text: '', value: 'amount', align: 'center' },
  ]

  // History
  historyHeaders: Array<{ text: string, value: string }> = [
    { text: 'amount', value: 'amount' },
    { text: 'txHash', value: 'hash' },
    { text: 'date', value: 'date' },
  ]

  pagination: any = {
    descending: true,
    itemsPerPage: -1,
  }
  transactionHistory: TransactionHistory[] = []
  nextPagingTransactionId?: string

  @Watch('wallet.address')
  onValueChange(newValue: string, oldValue: string): void {
    this.qrJson = NemHelper.qrJson(2, 2, 'nem2-wallet', newValue, 0, '')
  }

  mounted() {
    Vue.prototype.$toast('Hello NEM2 wallet')
    this.configure()
    this.onLogin()
  }

  async configure() {
    try {
      this.wallet = await this.loadWalletUseCase.execute()
      await this.onLoadBalance()
      await this.onLoadTransactionHistory()
    } catch (error) {
      console.error(error)
    }
  }

  async onLogin() {
    firebase.auth().onAuthStateChanged(async (response) => {
      if (response == null) {
        const user = await firebase.auth().signInAnonymously()
        console.log('onLogin', 'new user', user)
      } else {
        console.log('onLogin', 'already exist user', response)
      }
    })
  }

  async onLoadBalance() {
    this.$store.commit('startLoading')
    try {
      if (this.wallet === null) { return }
      this.assets = await this.loadBalanceUseCase.execute(this.wallet!.address!)
      console.log('balance', this.assets)
      if (this.assets.length !== 0) {
        this.sendAsset.mosaicId = this.assets[0].mosaicId
      }
    } catch (error) {
      console.error('balance', error)
    }
    this.$store.commit('stopLoading')
  }

  async onSend() {
    this.$store.commit('startLoading')
    try {
      this.resultMessage = ''
      if (this.validation().length !== 0) {
        throw new Error('Cloud not send coin.')
       }
      this.sendAsset.relativeAmount = Number(this.sendAsset.relativeAmount)
      const result = await this.sendCoinUseCase.execute(this.sendAsset)
      console.log('sendAsset', result)
      this.resultMessage = `SUCCESS: ${result.hash}`
    } catch (error) {
      console.error('sendAsset', error)
      this.resultMessage = `FAILED: ${error.message}`
    }
    Vue.prototype.$toast(this.resultMessage)
    this.$store.commit('stopLoading')
  }

  onClickAsset(item: AssetMosaic) {
    console.log('onClickAsset', item)
    this.sendAsset.mosaicId = item.mosaicId
    this.sendAsset.divisibility = item.divisibility
  }

  onClickHistory(item: TransactionHistory) {
    console.log('onClickHistory', item)
    this.$router.push({ name: 'transaction_page', params: { transactionId: item.id } })
  }

  async onLoadTransactionHistory(initLoad: boolean = false) {
    this.$store.commit('startLoading')
    try {
      if (initLoad === true) {
        this.transactionHistory = []
        this.nextPagingTransactionId = undefined
      }
      const historyInfo = await this.loadTransactionHistoryUseCase.executeTransferHistoryAll(100, this.nextPagingTransactionId)
      console.log('history', historyInfo)
      if (historyInfo.histories.length !== 0) {
        this.nextPagingTransactionId = historyInfo.nextPagingTransactionId
      }
      this.transactionHistory.push(...historyInfo.histories)
      console.log('onLoadTransactionHistory', this.transactionHistory, this.nextPagingTransactionId )
    } catch (error) {
      console.error('onLoadTransactionHistory', error)
    }
    this.$store.commit('stopLoading')
  }

  validation(): string[] {
    this.errorMessages = []
    console.log(this.sendAsset)
    if (this.sendAsset.address.length !== 40) {
      this.errorMessages.push('Address (except "-") is 40 characters')
    }
    if (!/^[a-zA-Z0-9-]+$/.test(this.sendAsset.address)) {
      this.errorMessages.push('Invalid input')
    }
    if (this.sendAsset.message !== undefined && this.sendAsset.message!.length > 1024) {
      this.errorMessages.push('Maximum number of characters in message has exceeded')
    }
    return this.errorMessages
  }

  clear() {
    this.sendAsset.clear()
  }
}
</script>
<style lang="stylus" scoped>
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

.menu
  &__list
    margin 8px 30px
    text-align left

td
  word-break break-all

</style>