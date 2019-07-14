<template>
  <div class="home">
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { FetchLoadBalanceUseCase } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCase } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCase } from '@/domain/usecase/FetchSendCoinUseCase'

@Component
export default class HomePage extends Vue {
  @Inject('FetchLoadBalanceUseCase') fetchLoadBalanceUseCase!: FetchLoadBalanceUseCase
  @Inject('FetchLoadWalletUseCase') fetchLoadWalletUseCase!: FetchLoadWalletUseCase
  @Inject('FetchSendCoinUseCase') fetchSendCoinUseCase!: FetchSendCoinUseCase

  mounted() {
    this.loadBalance()
    this.fetchLoadWalletUseCase.execute()
  }

  async loadBalance() {
    await this.fetchLoadBalanceUseCase.execute()
  }

  async sendCoin() {
    const address = ''
    const amount = 0
    const message = ''
    await this.fetchSendCoinUseCase.execute(address, amount, message)
  }
}
</script>
