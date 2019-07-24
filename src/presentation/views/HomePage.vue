<template>
  <div class="homepage">
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
            <v-card-text>{{ balance }} xem</v-card-text>
            <v-card-actions>
              <v-card-title>
                <h3>Address</h3>
              </v-card-title>
            </v-card-actions>
            <v-card-text>{{ wallet.address }}</v-card-text>
            <v-card flat>
              <qriously v-model="qrJson" :size=200 />
            </v-card>
            <div>
              <a href="#" @click="() => isShowPrivateKey = !isShowPrivateKey">Show PrivateKey</a>
              <div style="margin: 8px;" v-if="isShowPrivateKey">
                {{ wallet.privateKey }}
              </div>
            </div>
          </v-card>
          <v-card flat>
            <v-card-actions>
              <v-card-title>
                <h3>Send</h3>
              </v-card-title>
            </v-card-actions>
            <v-form style="margin: 4px 26px;">
              <v-text-field
                label="Address"
                v-model="sendCoinInfo.address"
                required
                placeholder="SADW6WXZVIUWIJ6RAWFSM4F4SJRUBRVOARXXIFSH" />
              <v-text-field
                label="NEM"
                v-model="sendCoinInfo.amount"
                type="number"
                required />
              <v-text-field
                label="Message"
                v-model="sendCoinInfo.message"
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
              <p v-html="resultMessage"/>
            </v-flex>
            <v-flex>
              <v-card-actions>
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
                  :headers="headers"
                  :items="transactionHistory"
                  :options.sync="pagination"
                  hide-default-footer
                  no-data-text="">
                  <template 
                    v-slot:item="props">
                    <tr @click="onClick(props.item)">
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
import { FetchLoadBalanceUseCase } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCase } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCase } from '@/domain/usecase/FetchSendCoinUseCase'
import { FetchLoadTransactionHistoryUseCase } from '@/domain/usecase/FetchLoadTransactionHistoryUseCase'
import { Wallet } from '@/domain/entity/Wallet'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { NemHelper } from '@/domain/helper/NemHelper'

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
  @Inject('FetchLoadBalanceUseCase') fetchLoadBalanceUseCase!: FetchLoadBalanceUseCase
  @Inject('FetchLoadWalletUseCase') fetchLoadWalletUseCase!: FetchLoadWalletUseCase
  @Inject('FetchSendCoinUseCase') fetchSendCoinUseCase!: FetchSendCoinUseCase
  @Inject('FetchLoadTransactionHistoryUseCase') fetchLoadTransactionHistoryUseCase!: FetchLoadTransactionHistoryUseCase

  balance: number = 0
  sendCoinInfo: { address: string, amount: number, message: string } = { address: '', amount: 0, message: '' }
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

  headers: Array<{ text: string, value: string }> = [
    { text: 'amount', value: 'amount' },
    { text: 'txHash', value: 'hash' },
    { text: 'date', value: 'date' },
  ]

  pagination: any = {
    // sortBy: 'date',
    descending: true,
    itemsPerPage: -1,
  }
  transactionHistory: TransactionHistory[] = []
  transactionId?: string

  @Watch('wallet.address')
  onValueChange(newValue: string, oldValue: string): void {
    this.qrJson = NemHelper.qrJson(2, 2, 'nem2-wallet', newValue, 0, '')
  }

  mounted() {
    Vue.prototype.$toast('Hello NEM2 wallet')
    this.configure()
  }

  async configure() {
    try {
      this.wallet = await this.fetchLoadWalletUseCase.execute()
      await this.onLoadBalance()
      await this.onLoadTransactionHistory()
    } catch (error) {
      console.error(error)
    }
  }

  async onLoadBalance() {
    this.$store.commit('startLoading')
    try {
      if (this.wallet === null) { return }
      this.balance = await this.fetchLoadBalanceUseCase.execute(this.wallet!.address!)
      console.log('balance', this.balance)
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
      const wallet = await this.fetchLoadWalletUseCase.execute()
      const result = await this.fetchSendCoinUseCase.execute(this.sendCoinInfo.address, Number(this.sendCoinInfo.amount), this.sendCoinInfo.message)
      console.log('sendCoin', result)
      this.resultMessage = `SUCCESS: ${result.hash}`
    } catch (error) {
      console.error('sendCoin', error)
      this.resultMessage = `FAILED: ${error.message}`
    }
    Vue.prototype.$toast(this.resultMessage)
    this.$store.commit('stopLoading')
  }

  onClick(item: TransactionHistory) {
    console.log('onClick', item)
    this.$router.push({ name: 'transaction_page', params: { transactionId: item.id } })
  }

  async onLoadTransactionHistory(initLoad: boolean = false) {
    this.$store.commit('startLoading')
    try {
      if (initLoad === true) {
        this.transactionHistory = []
        this.transactionId = undefined
      }
      const history = await this.fetchLoadTransactionHistoryUseCase.executeTransferHistoryAll(20, this.transactionId)
      console.log('history', history)
      if (history.length !== 0) {
        this.transactionId = history[history.length - 1].id
      }
      this.transactionHistory.push(...history)
      console.log('onLoadTransactionHistory', this.transactionHistory, this.transactionId )
    } catch (error) {
      console.error('onLoadTransactionHistory', error)
    }
    this.$store.commit('stopLoading')
  }

  validation(): string[] {
    this.errorMessages = []
    console.log(this.sendCoinInfo)
    if (this.sendCoinInfo.address.length !== 40) {
      this.errorMessages.push('Address (except "-") is 40 characters')
    }
    if (!/^[a-zA-Z0-9-]+$/.test(this.sendCoinInfo.address)) {
      this.errorMessages.push('Invalid input')
    }
    if (this.sendCoinInfo.message.length > 1024) {
      this.errorMessages.push('Maximum number of characters in message has exceeded')
    }
    return this.errorMessages
  }

  clear() {
    this.sendCoinInfo = { address: '', amount: 0, message: '' }
  }
}
</script>
<style lang="stylus" scoped>
.homepage
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