import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'


import NeuronPool from '@/assets/NeuronES6/pool.js'
import Oracle from '@/assets/NeuronES6/oracle.js'

window.pool = new NeuronPool();
window.oracle = new Oracle();

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
Vue.use(Buefy)

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
