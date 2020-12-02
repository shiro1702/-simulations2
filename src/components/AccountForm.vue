<template>
  <div class="">
    <h2 v-if="i < 0" class="is-size-4 mb-3">new account</h2>
    <h2 v-else class="is-size-4 mb-3"> account {{i + 1}}</h2>
    <div v-for="item in currentAccount" 
        :key="item.name"
        class="is-flex is-align-items-center mb-4"
        >
        <b-checkbox v-model="item.checked"
            class="is-flex-grow-0">
            {{item.name+ ':'}}
        </b-checkbox>
        <b-input class="is-flex-grow-2" v-model="item.value" ></b-input>
        <b-tooltip v-if="item.tooltip" 
            class="control ml-2"
            :label="item.tooltip" 
            multilined>
          <b-icon
              icon="help-circle-outline">
          </b-icon>
        </b-tooltip>
    </div>

    <b-button v-if="i < 0" 
        type="is-primary" 
        @click="addBalanceToAccount({data: currentAccountFormat, pricesFormat: pricesFormat}), $parent.close()">
      Create account
    </b-button>  
    <template v-else >
      <b-button 
          type="is-primary" 
          @click="addBalanceToAccount({data: currentAccountFormat, pricesFormat: pricesFormat, i: i}), $parent.close()">
        Add coins
      </b-button> 
      <!-- <b-button 
          type="is-danger"
          outlined
          @click="deleteItem(i-1), $parent.close()">
        Delete account
      </b-button>   -->
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  props: ['title', 'i', 'pricesFormat'],
  data() {
    return {
      currentAccount: [
        {
          name: "",
          value: 0,
          checked: false,
        },
      ],
      defaultAccount: [
        {
          name: "BTC",
          value: 100,
          checked: false,
        },
        {
          name: "ETH",
          value: 100,
          checked: false,
        },
        {
          name: "USDT",
          value: 100,
          checked: false,
        },
        {
          name: "EOS",
          value: 100,
          checked: false,
        },
        {
          name: "sUSD",
          value: 100,
          checked: false,
        }
      ],
    }
  },
  computed: {
    ...mapState('accounts', {'accounts': 'items', 'poolAccounts':'poolAccounts' }),
    currentAccountFormat(){
      let balance = {};
      this.currentAccount.forEach(item2 => {
        if (item2.checked) {
          balance[item2.name] = item2.value
        }
      })
      return balance
    },
  },
  methods: {
    ...mapActions('accounts', ['saveItem', 'deleteItem', 'addBalanceToAccount']),
    unformat(data){
      // console.log('data', data);
      let newData = []
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData.push({
            name: key,
            value: data[key].toString(),
            checked: true,
          })
        }
      }
      return newData
    }
  },
  created(){
    this.currentAccount = this.defaultAccount.map(item => item);
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">

</style>
