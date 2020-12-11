<template>
  <div>
    <h2 class="is-size-4 mb-3">{{title}}</h2>
    <div class="accountsFrom__scroll">
      <div v-for="(item, index) in poolAccounts" 
          class="mb-4"
          :key="'poolAccounts'+index"
          grouped group-multiline>
        <div class="mb-2">
          <span>№{{1 + parseInt(index)}} Balance: <b>{{accountSumm[index]}} </b>USD</span>
          <b-button 
              class="ml-3"
              size="is-small" 
              icon-left="plus"
              @click="openEditModal(index)">
          </b-button>
        </div>
        <div class="is-flex is-flex-wrap-wrap">
          <div v-for="(item2, key) in item.balance" :key="'balance'+index+key" class="control mr-3 mb-3">
            <b-tooltip :label="item2.toString()"
              position="is-bottom">
              <b-taglist attached>
                <b-tag type="is-primary is-light" size="is-medium">{{key}}</b-tag>
                <b-tag type="is-primary" size="is-medium">{{item2.toString().split('.')[0]}}{{item2.toString().split('.')[1]?'.'+item2.toString().split('.')[1].slice(0, 4):''}}</b-tag>
              </b-taglist>
            </b-tooltip>
          </div>
        </div>
      </div>
    </div>
    <b-button type="is-primary" @click="openEditModal(-1)">add account</b-button>  

    <b-modal v-model="accountModal" :width="440"
      >
      <div v-if="accountModal" class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <cmp-account-form :title="'test'" :i="currentAccountindex" 
            :pricesFormat="pricesFormat">
          </cmp-account-form>
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import AccountForm from '@/components/AccountForm.vue'

export default {
  props: {
    title: {
      default: '',
    }, 
    tokenOptions: {
      default: [],
    },
    pricesFormat: {
      default: {},
    }
  },
  components: {
    'cmp-account-form': AccountForm,
  },
  data() {
    return {
      accountModal: false,
      currentAccount: {},
      // curentIndex: -1,
      currentAccountindex: -1,
      // create: false,
      
    }
  },
  computed: {
    ...mapState('accounts', ['poolAccounts']),
    ...mapGetters('accounts', {'accountsChecked': 'itemsChecked', 'accountSumm':'accountSumm'}),
  },
  methods: {
    openEditModal(index){
      this.accountModal = true; 
      // this.create = false;
      // this.currentAccount = Object.assign({}, this.accounts[index]);
      this.currentAccountindex = index;
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">
  .accountsFrom
    &__scroll
      overflow: scroll
      overflow-x: no-scroll
      overflow-y: scroll
      min-height: 100%
      max-height: 500px

</style>
