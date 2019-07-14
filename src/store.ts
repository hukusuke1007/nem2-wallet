import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLoading: false,
  },
  mutations: {
		stopLoading(state) {
			state.isLoading = false
		},
		startLoading(state) {
			state.isLoading = true
		},
  },
  actions: {

  },
});
