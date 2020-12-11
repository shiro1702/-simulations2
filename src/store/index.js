import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import accounts from './modules/accounts.js'
import prices from './modules/prices.js'

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    accounts,
    prices,
  }
})
