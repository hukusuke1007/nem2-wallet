import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import Vuetify from 'vuetify'
import colors from 'vuetify/es5/util/colors'
import 'vue2-toast/lib/toast.css'
import Toast from 'vue2-toast'
import VueQriously from 'vue-qriously'
import { provide } from './provide'


Vue.use(Vuetify, {
  theme: {
    original: colors.purple.base,
    theme: '#FFDEEA',
    background: '#FFF6EA',
    view: '#ffa07a',
    select: '#FF7F78',
    button: '#5FACEF',
  },
  options: {
    themeVariations: ['original', 'secondary'],
  },
})
Vue.use(Toast, {
  defaultType: 'bottom',
  duration: 3000,
  wordWrap: true,
  width: '280px',
})
Vue.use(VueQriously)

Vue.config.productionTip = false

new Vue({
  provide,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
