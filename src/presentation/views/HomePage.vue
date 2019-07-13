<template>
  <div class="home">
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { FetchLoadBalanceUseCaseImpl } from '@/domain/usecase/FetchLoadBalanceUseCase'
import { FetchLoadWalletUseCaseImpl } from '@/domain/usecase/FetchLoadWalletUseCase'
import { FetchSendCoinUseCaseImpl } from '@/domain/usecase/FetchSendCoinUseCase'

@Component
export default class HomePage extends Vue {
  @Inject('FetchLoadBalanceUseCase') fetchLoadBalanceUseCase!: FetchLoadBalanceUseCaseImpl
  @Inject('FetchLoadWalletUseCase') FetchLoadWalletUseCase!: FetchLoadWalletUseCaseImpl
  @Inject('FetchSendCoinUseCase') FetchSendCoinUseCase!: FetchSendCoinUseCaseImpl

  mounted() {
    this.loadBalance()
  }

  async loadBalance() {
    await this.fetchLoadBalanceUseCase.execute()
  }

  async sendCoin() {
    const address = ''
    const amount = 0
    const message = ''
    await this.FetchSendCoinUseCase.execute(address, amount, message)
  }
}
</script>
