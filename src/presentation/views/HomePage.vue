<template>
  <div class="home">
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { FetchLoadBalanceUseCase } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCase } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCase } from '@/domain/usecase/FetchSendCoinUseCase'
import { FetchLoadTransactionHistoryUseCase } from '@/domain/usecase/FetchLoadTransactionHistoryUseCase'

@Component
export default class HomePage extends Vue {
  @Inject('FetchLoadBalanceUseCase') fetchLoadBalanceUseCase!: FetchLoadBalanceUseCase
  @Inject('FetchLoadWalletUseCase') fetchLoadWalletUseCase!: FetchLoadWalletUseCase
  @Inject('FetchSendCoinUseCase') fetchSendCoinUseCase!: FetchSendCoinUseCase
  @Inject('FetchLoadTransactionHistoryUseCase') fetchLoadTransactionHistoryUseCase!: FetchLoadTransactionHistoryUseCase

  mounted() {
    this.configure()
  }

  async configure() {
    const wallet = await this.fetchLoadWalletUseCase.execute()
    const balance = await this.onLoadBalance(wallet.address!)

    try {
      const history = await this.fetchLoadTransactionHistoryUseCase.execute(20)
      console.log(history)
    } catch (error) {
      console.error(error)
    }
  }

  async onLoadBalance(addr: string) {
    try {
      const balance = await this.fetchLoadBalanceUseCase.execute(addr)
      console.log('balance', balance)
    } catch (error) {
      console.error('balance', error)
    }
  }

  async onSend() {
    const wallet = await this.fetchLoadWalletUseCase.execute()
    const address = 'SADW6WXZVIUWIJ6RAWFSM4F4SJRUBRVOARXXIFSH'
    const amount = 1
    const message = 'Hello'
    try {
      const result = await this.fetchSendCoinUseCase.execute(address, amount, message)
      console.log('sendCoin', result)
    } catch (error) {
      console.error('sendCoin', error)
    }
  }
}
</script>
