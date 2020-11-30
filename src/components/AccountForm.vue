<template>
  <div class="">
    <h2 class="is-size-4"> account {{i + 1}}</h2>
    <div v-for="item in currentAccount" 
        :key="item.name"
        class="is-flex is-align-items-center"
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
        @click="saveItem({data: currentAccount}), $parent.close()">
      Create account
    </b-button>  
    <template v-else >
      <b-button 
          type="is-primary" 
          @click="saveItem({data: currentAccount, i: i}), $parent.close()">
        Save account
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
  props: ['title', 'i'],
  methods: {
    ...mapActions('accounts', ['saveItem', 'deleteItem'])
  },
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
          value: 10500,
          checked: false,
        },
        {
          name: "ETH",
          value: 350,
          checked: false,
        },
        {
          name: "USDT",
          value: 1,
          checked: false,
        },
        {
          name: "EOS",
          value: 2,
          checked: false,
        },
        {
          name: "sUSD",
          value: 1,
          checked: false,
        }
      ],
    }
  },
  computed: {
    ...mapState('accounts', {'accounts': 'items'}),
  },
  created(){
    if (this.i < 0){
      this.currentAccount = this.defaultAccount.map(item => item);
    } else {
      this.currentAccount = this.accounts[this.i].map(item => item);
    }
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">

</style>
