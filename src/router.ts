import Vue from 'vue'
import Router from 'vue-router'
import HomePage from './presentation/views/HomePage.vue'
import TransactionPage from './presentation/views/TransactionPage.vue'
import AssetExchangePage from './presentation/views/AssetExchangePage.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home_page',
      component: HomePage,
    },
    {
      path: '/transaction_page/:transactionId',
      name: 'transaction_page',
      component: TransactionPage,
      props: true,
    },
    {
      path: '/asset_exchange_page',
      name: 'asset_exchange_page',
      component: AssetExchangePage,
    },
  ],
})
