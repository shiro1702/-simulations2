<template>
  <div class="">
    <h2 class="is-size-4">{{title}}</h2>
    <div class="accountsFrom__scroll">

    </div>
    <div v-for="(item, index) in accountsChecked" 
        class="is-flex is-flex-wrap-wrap"
        :key="index"
        grouped group-multiline>
      <span>№{{index+1}} Balance:</span>
      <div v-for="item2 in item" :key="item2.name" class="control">
        <b-taglist  attached>
          <b-tag type="is-primary is-light" size="is-medium">{{item2.name}}</b-tag>
          <b-tag type="is-primary" size="is-medium">{{item2.value}}</b-tag>
        </b-taglist>
        </div>
      <b-button type="is-primary" @click="openEditModal(index)">Edit</b-button>  
    </div>
    <b-button type="is-primary" @click="openEditModal(-1)">add account</b-button>  

    <b-modal v-model="accountModal" :width="440"
      >
      <div v-if="accountModal" class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <cmp-account-form :title="'test'" :i="currentAccountindex">
          </cmp-account-form>
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import AccountForm from '@/components/AccountForm.vue'

export default {
  props: {
    title: {
      default: '',
    }, 
    tokenOptions: {
      default: [],
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
    // ...mapState('accounts', {'accounts': 'items'}),
    ...mapGetters('accounts', {'accountsChecked': 'itemsChecked'}),
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

</style>
