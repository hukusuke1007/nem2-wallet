import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import 'vue2-toast/lib/toast.css'
import Toast from 'vue2-toast'
import VueQriously from 'vue-qriously'
import { provide } from './provide'

// Vuetify
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/lib/util/colors'


// Firebase
import * as firebase from 'firebase/app'
import * as Ballcap from '@1amageek/ballcap'
import '@firebase/firestore'
import { firebaseConfig } from '@/config/FirebaseConfig'

const app = firebase.initializeApp(firebaseConfig)
Ballcap.initialize(app.firestore(), app.firestore().collection('version').doc('1'))

const opts = {}

Vue.use(Vuetify)

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
  vuetify: new Vuetify(),
  render: (h) => h(App),
}).$mount('#app')
