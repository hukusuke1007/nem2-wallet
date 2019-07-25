<template>
  <div class="transactionpage">
    <v-flex xs12 sm6 offset-sm3 v-if="transactionHistory!==null">
      <v-flex>
        <div style="margin: 8px;"> 
          <h2>Transaction detail</h2>
        </div>
        <table border="1" class="table__list">
          <tr>
            <td width="30%" class="table__key">id</td>
            <td width="70%" class="table__value">{{ transactionHistory.id }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">hash</td>
            <td width="70%" class="table__value">{{ transactionHistory.hash }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">fromAddress</td>
            <td width="70%" class="table__value">{{ transactionHistory.fromAddress }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">toAddress</td>
            <td width="70%" class="table__value">{{ transactionHistory.toAddress }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">amount</td>
            <td width="70%" class="table__value">{{ transactionHistory.amount }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">fee</td>
            <td width="70%" class="table__value">{{ transactionHistory.fee }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">message</td>
            <td width="70%" class="table__value">{{ transactionHistory.message }}</td>
          </tr>
          <tr>
            <td width="30%" class="table__key">date</td>
            <td width="70%" class="table__value">{{ transactionHistory.date | dateFormat }}</td>
          </tr>
        </table>
      </v-flex>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { format } from 'date-fns'
import { LoadTransactionHistoryUseCase } from '@/domain/usecase/LoadTransactionHistoryUseCase'
import { TransactionHistory } from '@/domain/entity/TransactionHistory'
import { NemHelper } from '@/domain/helper/NemHelper'

@Component({
  name: 'TransactionPage',
  computed: mapState(['isLoading']),
	filters: {
		dateFormat(date: Date) {
			return format(date, 'YYYY/MM/DD HH:mm:ss')
    },
	},
})
export default class TransactionPage extends Vue {
  @Inject('LoadTransactionHistoryUseCase') loadTransactionHistoryUseCase!: LoadTransactionHistoryUseCase

  @Prop() transactionId?: string
  transactionHistory: TransactionHistory | null = null

  mounted() {
    this.configure()
    console.log(this.transactionId)
  }

  async configure() {
    this.onLoadTransactionHistory()
  }

  async onLoadTransactionHistory() {
    this.$store.commit('startLoading')
    if (this.transactionId === undefined) { return }
    try {
      this.transactionHistory = await this.loadTransactionHistoryUseCase.executeTransferHistory(this.transactionId!)
      console.log(this.transactionHistory)
    } catch (error) {
      console.error(error)
    }
    this.$store.commit('stopLoading')
  }


}
</script>
<style lang="stylus" scoped>
.transactionpage
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