<template>
  <div class="home py-6">
    <div class="columns fullHeight">
      <div class="column">
        <cmp-form :form="form1" title="Пул">
        </cmp-form>
        <b-field label="prices:"
            grouped group-multiline>
          <div v-for="item in prices" :key="item.name" class="control">
            <b-taglist attached>
              <b-tag type="is-primary is-light" size="is-medium">{{item.name}}</b-tag>
              <b-tag type="is-primary" size="is-medium">{{item.value}}</b-tag>
            </b-taglist>
           </div>
          <b-button 
              type="is-primary"
              size="is-small"
              icon-left="border-color"
              @click="priceModal = true">
          </b-button>
        </b-field>
      </div>
      <div class="column">
        <cmp-accounts-form
            :tokenOptions="[...config.tokens, config.stable]"
            :pricesFormat="pricesFormat"
            title="Аккаунты">
        </cmp-accounts-form>
      </div>
      <div class="column">
        <!-- <cmp-form :form="credit" title="Кредиты">
        </cmp-form>
        <cmp-form :form="bargaining" title="Торги">
        </cmp-form> -->

        <h2 class="is-size-4 mb-3">Операции</h2>
        <div class="columns is-multiline">

          <!-- <div class="column is-half">
            <b-button expanded type="is-primary">Запуск симуляции</b-button>
          </div> -->
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
              :disabled="tickDisble"
              @click="nextTick()">Сделать шаг</b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
              @click="createDepositModal = true">Сделать депозит</b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
              @click="returnDepositModal = true">Вернуть депозит</b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
              @click="mintModal = true">Выпуск стейбл</b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
              @click="tradeModal = true">Обмен</b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
            @click="borrowModal = true">Взять займ</b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
            @click="repayModal = true">Вернуть займ </b-button>
          </div>
          
          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
            @click="liquidateModal = true">Ликвидация займа</b-button>
          </div>
<!--           
          <div class="column is-half">
            <b-button expanded type="is-danger" outlined>Сброс</b-button>
          </div> -->
        </div>
      </div>
    </div>
    <div class="columns fullHeight" >
      <div class="column is-9" style="overflow: scroll">
        <h2 class="is-size-4 mb-3">Результат</h2>
         
          <b-table :data="this.table" :columns="columns"></b-table>
      </div>
      <div class="column is-3">
        <h2 class="is-size-4 mb-3 ">История</h2>
        <div class="history" ref="history">
          <div v-for="(item, index) in history" :key="index">
            {{index}}) {{item}}
          </div>
        </div>
      </div>
    </div>
    <!-- <b-button type="is-primary" @click="tokenModal = true">Primary</b-button> -->  
    <b-modal v-model="tokenModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
        </section>
      </div>
      
    </b-modal>
    <b-modal v-model="priceModal" :width="440">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <cmp-form :form="prices" title="Prices">
          </cmp-form>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="createDepositModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Сделать депозит</h2>
            <div class="columns is-multiline">
              <div class="column is-4">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="createDepositInfo.account"
                      name="account"
                      :native-value="parseInt(index)">
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">token</h2>
                <b-input type="number" class="is-flex-grow-2" v-model="createDepositInfo.value" ></b-input>
                <template v-if="poolAccounts[createDepositInfo.account]">
                  <div v-for="(item, index) in poolAccounts[createDepositInfo.account].balance"
                      :key="index">
                    <b-radio 
                        v-model="createDepositInfo.token"
                        name="token"
                        :native-value="index">
                        {{index}} {{item}}
                    </b-radio>
                  </div>
                </template>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">Внести {{createDepositInfo.tokenInput}}<br> 
                {{createDepositInfo.token}} от аккаунта №{{createDepositInfo.account+1}} в депозит</h2>
                <b-button expanded type="is-primary" outlined
                  :disabled="createDepositBtn"
                  @click="createDeposit(createDepositInfo), createDepositModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="returnDepositModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Вернуть депозит</h2>
            <div class="columns is-multiline">
              <div class="column is-4">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="returnDepositInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setReturnOptionToDeposit(parseInt(index))"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">token</h2>
                <b-input type="number" class="is-flex-grow-2" v-model="returnDepositInfo.value" ></b-input>
                <div v-for="(item, index) in returnDepositInfo.options"
                    :key="index">
                  <b-radio 
                      v-model="returnDepositInfo.token"
                      name="token"
                      :native-value="item.name">
                      {{item.name}} {{item.value}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">Вывести {{returnDepositInfo.tokenInput}}<br> 
                {{returnDepositInfo.token}} от аккаунта №{{returnDepositInfo.account+1}} на личный баланс</h2>

                <b-button expanded type="is-primary" outlined
                  :disabled="returnDepositBtn"
                  @click="returnDeposit(returnDepositInfo), returnDepositModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="borrowModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Взять займ</h2>
            <div class="columns is-multiline">
              <div class="column is-4">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="borrowInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setReturnOptionToBorrow(parseInt(index), borrowInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">you get (max - {{borrowInfo.maxBorrow}})</h2>
                <b-input type="number" class="is-flex-grow-2" v-model="borrowInfo.value" ></b-input>

                <div v-for="(item, index) in borrowInfo.options"
                    :key="index">
                  <b-radio 
                      v-model="borrowInfo.token"
                      name="token1"
                      :native-value="item"
                      
                      @click.native="setReturnOptionToBorrow(borrowInfo.account, item)">
                      {{item}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">Обеспеченность займа: 200% </h2>
                <h2 class="is-size-6">Занять <br>
                  {{borrowInfo.payValue}} {{borrowInfo.token}} <br>
                аккаунту №{{borrowInfo.account+1}}</h2>
                <b-button expanded type="is-primary" outlined
                
                  :disabled="borrowBtn"
                 @click="borrow(borrowInfo), borrowModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="mintModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Выпуск стейблкоинов</h2>
            <div class="columns is-multiline">
              <div class="column is-4">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="mintInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setMaxToMint(parseInt(index), mintInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">you get (max - {{mintInfo.maxMint}})</h2>
                <b-input type="number" class="is-flex-grow-2" v-model="mintInfo.value" ></b-input>

                <div v-for="(item, index) in mintInfo.options"
                    :key="index">
                  <b-radio 
                      v-model="mintInfo.token"
                      name="token1"
                      :native-value="item"
                      
                      @click.native="setReturnOptionToBorrow(mintInfo.account, item)">
                      {{item}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">
                 Выпустить для аккаунта №{{mintInfo.account+1}} {{mintInfo.token}} {{mintInfo.value}} </h2>
                <b-button expanded type="is-primary" outlined
                 @click="mint(mintInfo), mintModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="tradeModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Обмен</h2>
            <div class="columns is-multiline">
              <div class="column is-3">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="tradeInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      >
                      <!-- @click.native="setMaxToMint(index, tradeInfo.token)" -->
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-6">
                <div  style="width: 50%">

                  <h2 class="is-size-6">you get</h2>
                  <b-input type="number" class="is-flex-grow-2" v-model="tradeInfo.value" ></b-input>
                </div>
                <div class="columns">

                  <div class="column is-6">
                    <template v-if="poolAccounts[tradeInfo.account]">
                      <div v-for="(item, index) in poolAccounts[tradeInfo.account].balance"
                          :key="index">
                        <b-radio 
                            v-model="tradeInfo.token"
                            name="token1"
                            :native-value="index">
                            {{index}} {{item}}
                        </b-radio>
                      </div>
                    </template>
                  </div>
                  <div class="column is-6">
                    <div v-for="(item, index) in tradeInfo.options"
                        :key="index">
                      <b-radio 
                          v-model="tradeInfo.token2"
                          name="token2"
                          :native-value="item">
                          {{item}}
                      </b-radio>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-3">
                <h2 class="is-size-6">
                  Обменять для аккаунта  №{{tradeInfo.account+1}} {{tradeInfo.token}} {{tradeInfo.value}} на {{tradeInfo.token2}} </h2>
                <b-button expanded type="is-primary" outlined
                  :disabled="createTradeBtn"
                  @click="trade(tradeInfo), tradeModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="repayModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Вернуть займ</h2>
            <div class="columns is-multiline">
              <div class="column is-4">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="repayInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setRepayAccountInfo(parseInt(index))"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">token</h2>
                <b-input type="text" class="is-flex-grow-2" v-model="repayInfo.value" ></b-input>
                <div v-for="(item, index) in repayInfo.borrows"
                    :key="index">
                  <b-radio 
                      v-model="repayInfo.token"
                      name="token"
                      :native-value="item.name"
                      >
                      {{item.name}} - {{item.value}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6">loan: 1200 ETH for 12 BTC</h2>
                <h2 class="is-size-6">срок: 12 мес</h2>
                <h2 class="is-size-6">к возврату: {{repayInfo.sumBorrowPlusEffects }} ETH</h2>
                <h2 class="is-size-6">обеспечение: {{repayInfo.sumCollateral}} BTC</h2>
                <h3 class="is-size-8">
                  Вернуть займ аккаунта №{{repayInfo.account+1}} в размере 1300 ЕTH и вернуть 13 BTC
                  {{repayInfo.payValue}} {{repayInfo.token}} <br>
                </h3>
                <b-button expanded type="is-primary" outlined
                 @click="repay(repayInfo), repayModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="liquidateModal" :width="740">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Ликвидация займа</h2>
            <div class="columns is-multiline">
              <div class="column is-2">
                <h2 class="is-size-6">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="liquidateInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setMaxLiquidate(parseInt(index), liquidateInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                
                <h2 class="is-size-6">token max({{liquidateInfo.maxLiquidate}})</h2>

                <b-input type="text" class="is-flex-grow-2" v-model="liquidateInfo.value" ></b-input>
                <template v-if="poolAccounts[createDepositInfo.account]">
                  <div v-for="(item, index) in poolAccounts[liquidateInfo.account].balance"
                      :key="index">
                    <b-radio 
                        v-model="liquidateInfo.token"
                        name="token"
                        :native-value="index"
                        @click.native="setMaxLiquidate(liquidateInfo.account, item)"
                        >
                        {{index}}
                    </b-radio>
                  </div>
                </template>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6">account2</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="liquidateInfo.account2"
                      name="account2"
                      :native-value="parseInt(index)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6">token2</h2>

                <template v-if="poolAccounts[liquidateInfo.account2]">
                  <div v-for="(item, index) in poolAccounts[liquidateInfo.account2].balance"
                      :key="index">
                    <b-radio 
                        v-model="liquidateInfo.token2"
                        name="token2"
                        :native-value="index"
                        >
                        {{index}} {{item}}
                    </b-radio>
                  </div>
                </template>
              </div>
              <div class="column is-4">
                <h3 class="is-size-8">
                  Ликвидировать займ аккаунта №{{liquidateInfo.account+1}} 
                  и перевести 1200 {{liquidateInfo.token}} в пул
                  
                </h3>
                <b-button expanded type="is-primary" outlined
                 @click="liquidate(liquidateInfo), liquidateModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import config from '@/assets/NeuronES6/config.js'


// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import Form from '@/components/Form.vue'
import AccountsForm from '@/components/AccountsForm.vue'

console.log();
export default {
  name: 'Home',
  components: {
    'cmp-form': Form,
    'cmp-accounts-form': AccountsForm
  },
  // watch: {
  //   form1: {
  //     handler(val) { 
  //       console.log(val);
  //      },
  //     deep: true
  //   },
  // },
  data() {
    return {
      tickDisble: true,
      tokenModal: false,
      priceModal: false,
      createDepositModal: false,
      createDepositInfo: {
        account: 0,
        value: 0,
        token: '',
      },
      returnDepositModal: false,
      returnDepositInfo: {
        account: 0,
        value: 0,
        token: '',
        options: []
      },
      borrowModal: false,
      borrowInfo: {
        account: 0,
        value: 0,
        token: '',
        options: config.tokens,
        maxBorrow: 0,
      },
      mintModal: false,
      mintInfo: {
        account: 0,
        value: 0,
        token: '',
        options: config.stable,
        maxMint: 0,
      },
      tradeModal: false,
      tradeInfo: {
        account: 0,
        value: 0,
        token: '',
        token2: '',
        options: config.tokens,
        maxMint: 0,
      },
      repayModal: false,
      repayInfo: {
        account: 0,
        value: 0,
        getValue: 0,
        borrows: [],
        token: '',
        depositsToken: '',
        sumCollateral: 0,
        sumBorrowPlusEffects: 0,
      },
      liquidateModal: false,
      liquidateInfo: {
        account: 0,
        account2: 0,
        value: 0,
        maxLiquidate: 0,
        options: config.tokens,
        borrows: 0,
        token: '',
        token2: '',
      },
      form1: [
        {
          name: 'tokens',
          value: config.tokens,
          options: config.tokens,
          tooltip: 'Изменить список токенов в пуле',
        },
        {
          name: 'stable',
          value: config.stable,
          options: config.stable,
          tooltip: 'Изменить список стейбл коинов в пуле',
        },
        {
          name: 'tradeFee',
          value: config.tradeFee,
        },
        {
          name: 'baseRate',
          value: config.baseRate,
        },
        {
          name: 'reserveFactor',
          value: config.reserveFactor,
        },
        {
          name: 'collateralFactor',
          value: config.collateralFactor,
        },
        {
          name: 'closeFactor',
          value: config.closeFactor,
        },
        {
          name: 'liquidationIncentive',
          value: config.liquidationIncentive,
        },
        {
          name: 'penaltyCoefficient',
          value: config.penaltyCoefficient,
        },
      ],
      table: [],
      columns: [
        {
            field: 'name',
            label: 'name',
        },
        {
            field: 'value',
            label: 'value',
        },
        {
            field: 'totalBorrows',
            label: 'totalBorrows',
        },
        {
            field: 'borrowIndex',
            label: 'borrowIndex',
        },
        {
            field: 'totalReserves',
            label: 'totalReserves',
        },
        {
            field: 'price',
            label: 'price',
        },
        {
            field: 'capital',
            label: 'capital',
        },
        {
            field: 'weight',
            label: 'weight',
        },
        {
            field: 'staked',
            label: 'staked',
        },
        {
            field: 'prevDay',
            label: 'prevDay',
        },
    ],
      credit: [
        {
          name: 'tokens loan',
          value: [],
          options: [
            "BTC",
            "ETH",
            "USDT",
            "EOS",
            "NEO",
            "MKR",
            "XRP"
          ],
          tooltip: `Просмотреть и изменить
            список монет, которые 
            принимаются в качестве 
            депозита под обеспечение 
            займа`,
        },
        {
          name: 'tokens dep',
          value: [],
          options: [
            "BTC",
            "ETH",
            "USDT",
            "EOS",
            "NEO",
            "MKR",
            "XRP"
          ],
          tooltip: `Просмотреть и изменить
            список монет которые
            принимаются в качестве 
            депозита под обеспечение 
            займа`,
        },
        {
          name: 'minimum ratio:',
          value: '',
        },
        {
          name: 'liquidation penalty',
          value: '',
        },
        {
          name: 'stability fee',
          value: '',
        },
        {
          name: 'кол-во займов',
          value: '',
        },
        {
          name: 'процент возврата',
          value: '',
        },
      ],
      bargaining:  [
        {
          name: 'tokens',
          value: [],
          options: [
            "BTC",
            "ETH",
            "USDT",
            "EOS",
            "NEO",
            "MKR",
            "XRP"
          ],
          tooltip: `Просмотреть и изменить
            список монет которые
            могут участвовать в 
            торгах`,
        },
        {
          name: 'fee',
          value: '',
        },
        {
          name: 'baseRate',
          value: '',
        },
        {
          name: 'кол-во торгов',
          value: '',
        },
      ],
      prices: [
        {
          name: "BTC",
          value: 10500,
        },
        {
          name: "ETH",
          value: 350,
        },
        {
          name: "USDT",
          value: 1,
        },
        {
          name: "EOS",
          value: 2,
        },
        {
          name: "sUSD",
          value: 1
        }
      ],
      history: [
        
      ],
    }
  },
  computed: {
    ...mapState('accounts', {'accounts': 'items', 'poolAccounts': 'poolAccounts'}),
    ...mapGetters('accounts', {'accountsChecked': 'itemsChecked'}),
    pricesFormat(){
      let price = {}
      this.prices.forEach(item => {
        price[item.name] = item.value;
      });
      return price
    },
    config(){
      let confog = {}
      this.form1.forEach(item => {
        confog[item.name] = item.value;
      });
      return confog
    },
    createDepositBtn(){
      return !(
        this.createDepositInfo.token != '' && 
        parseFloat(this.createDepositInfo.value) > 0 && 
        this.poolAccounts[this.createDepositInfo.account] && 
        this.poolAccounts[this.createDepositInfo.account].balance && 
        this.poolAccounts[this.createDepositInfo.account].balance[this.createDepositInfo.token] &&
        parseFloat(this.createDepositInfo.value) <= parseFloat( this.poolAccounts[this.createDepositInfo.account].balance[this.createDepositInfo.token].toString() )
      )
    },
    returnDepositBtn(){
      const index = this.returnDepositInfo.options.findIndex(item=>{
        return item.name == this.returnDepositInfo.token
      })
      return !(
        this.returnDepositInfo.token != '' && 
        parseFloat(this.returnDepositInfo.value) > 0 && 
        this.returnDepositInfo.options[index] &&
        parseFloat(this.returnDepositInfo.value) <= parseFloat( this.returnDepositInfo.options[index].value )
      )
    },
    createTradeBtn(){
      return !(
        this.tradeInfo.token != '' && 
        parseFloat(this.tradeInfo.value) > 0 && 
        this.poolAccounts[this.tradeInfo.account] && 
        this.poolAccounts[this.tradeInfo.account].balance && 
        this.poolAccounts[this.tradeInfo.account].balance[this.tradeInfo.token] &&
        parseFloat(this.tradeInfo.value) <= parseFloat( this.poolAccounts[this.tradeInfo.account].balance[this.tradeInfo.token].toString() )
      )
    },
    borrowBtn(){
      return !(
        this.borrowInfo.token != '' && 
        parseFloat(this.borrowInfo.value) > 0 && 
        parseFloat(this.borrowInfo.value) <= parseFloat( this.borrowInfo.maxBorrow.toString() )
      )
    },
  },
  watch: {
    // accountsChecked(){
    //   this.AccountUpdate();
    // },
    config(val){
      window.pool.createPool(val);
      window.oracle.init(val);
    },
    pricesFormat(){
      this.updateResults();
    },
    history(){
      this.$refs.history.scrollTo({
        top: this.$refs.history.scrollHeight,
        behavior: "smooth"
      });
    },
    returnDepositModal(val){
      if (val){
        this.setReturnOptionToDeposit(this.returnDeposit.account);
      }
    },
    borrowModal(val){
      if (val){
        this.setReturnOptionToBorrow(this.borrowInfo.account, this.borrowInfo.token);
      }
    },
    mintModal(val){
      if (val){
        this.setMaxToMint(this.mintInfo.account, this.mintInfo.token);
      }
    },
    repayModal(val){
      if (val){
        this.setRepayAccountInfo(this.repayInfo.account);
      }
    },
    liquidateModal(val){
      if (val){
        this.setMaxLiquidate(this.liquidateInfo.account, this.liquidateInfo.token);
      }
    },
  },
  methods: {
    ...mapMutations('accounts', {accountEdit: 'editItem'}),
    ...mapActions('accounts', ['updateAccounts']),
    Create(){
      window.oracle.init(config);
      window.pool.createPool(config);
      // this.AccountUpdate();
    },
    // AccountUpdate(){
    //   console.log(this.accountsChecked);
    //   this.accountsChecked.forEach((item, index) => {
    //     let balance = {};
    //     item.forEach(item2 => {
    //       balance[item2.name] = item2.value
    //     })
    //     window.pool.accounts.issueBalance(index, balance)
    //     // console.log(window.pool.accounts.get(index));
    //   })
    //   // this.updateResults();
    // },

    updateResults(){
      
      let getInfo = window.pool.getInfo(this.pricesFormat)
      this.table = [];
      let reserves = getInfo.reserves;
      this.updateAccounts(this.pricesFormat);
      
      // тик только при наличии депозита
      const poolDeposit = window.pool._getTokens().filter((t) => !window.pool.reserves.getValue(t).equals(0));
      if (poolDeposit && poolDeposit.length > 0){
        this.tickDisble = false;
      }
      // end тик только при наличии депозита

      for (const key in reserves) {
        if (Object.prototype.hasOwnProperty.call(reserves, key)) {

          let element = {};
          element.name = key;
          for (const key2 in reserves[key]) {
            if (Object.prototype.hasOwnProperty.call(reserves, key)) {
              element[key2] = reserves[key][key2].toString();
            }
          }
          this.table.push(element)
        }
      }
      console.log( this.table );
    },
    nextTick(){
      window.pool.tick(1);
      this.updateResults();
      this.history.push('pool tick');
    },
    createDeposit(createDepositInfo){
      window.pool.deposit(createDepositInfo.account, { name: createDepositInfo.token, value: parseFloat(createDepositInfo.value) });
      this.updateResults();

      this.history.push(`создан депозит для аккаунта №${createDepositInfo.account + 1} на сумму ${createDepositInfo.token} ${createDepositInfo.value}`);
    },
    setReturnOptionToDeposit(val){
      // console.log(val);
      let balance= window.pool.accounts.get(val).balance
      // console.log(balance);
      let options = []
      for (let key in balance) {
        options.push({
          name: key,
          value: balance[key].toString()
        })
      }
      this.$set( this.returnDepositInfo, 'options', options )
      // console.log(this.returnDepositInfo.options);
    },
    returnDeposit(returnDepositInfo){
      // console.log(window.pool.redeem(accountId1, "BTC", 100));
      console.log('account', returnDepositInfo.account);
      console.log('token', returnDepositInfo.token);
      console.log('value', returnDepositInfo.value);
      const test = window.pool.redeem(returnDepositInfo.account, returnDepositInfo.token, parseFloat(returnDepositInfo.value) );
      this.updateResults();
      if (test.error) {
        this.$buefy.toast.open({
          message: `Ошибка вывода средств! ${test.error.message}`,
          type: 'is-danger'
        })
        this.history.push(`ошибка возврата депозита для аккаунта №${returnDepositInfo.account + 1} на сумму ${returnDepositInfo.token} ${returnDepositInfo.value}`);
      } else {
        console.log('test', test);
        this.history.push(`возврат депозита для аккаунта №${returnDepositInfo.account + 1} на сумму ${returnDepositInfo.token} ${returnDepositInfo.value}`);
      }
    },
    setReturnOptionToBorrow(val, val2){
      // console.log(val);
      // maxBorrow
      console.log('getMaxBorrow', window.pool.getMaxBorrow(val, val2).toString());
      this.borrowInfo.maxBorrow = window.pool.getMaxBorrow(val, val2).toString();
    },
    borrow(borrowInfo){
      const test = window.pool.borrow(borrowInfo.account, { name: borrowInfo.token, borrowAmount: parseFloat(borrowInfo.value) });
      this.updateResults();
      if (!test){
        this.$buefy.toast.open({
          message: `Ошибка! Не достаточно средств в Пуле`,
          type: 'is-danger'
        })
        this.history.push(`не удачная попытка аккаунта №${borrowInfo.account + 1} взять займ на сумму ${borrowInfo.token} ${borrowInfo.value}`);
      } else {

        this.history.push(`аккаунт №${borrowInfo.account + 1} взял займ на сумму ${borrowInfo.token} ${borrowInfo.value}`);
      }


    },
    repay(repayInfo){
      window.pool.repay(repayInfo.account, repayInfo.token, parseFloat(repayInfo.value));
      this.updateResults();
      this.history.push(`аккаунт №${repayInfo.account + 1} вернул займ на сумму ${repayInfo.token} ${repayInfo.value}`);
    },
    setRepayAccountInfo(accountIndex){
      let account = window.pool.getInfo(this.pricesFormat).accounts[accountIndex];
      console.log(account.borrows);
      // console.log(account.borrows.value.toString());
      // account
      this.repayInfo.borrows = []
      for (const key in account.borrows) {
        if (Object.prototype.hasOwnProperty.call(account.borrows, key)) {
          this.repayInfo.borrows.push({
            name: key,
            value: account.borrows[key].value?account.borrows[key].value.toString(): '',
          })
        }
      }
      
      // this.repayInfo.depositsToken = account.deposits
      // this.repayInfo.deposits = account.deposits.toString();
      // this.repayInfo.sumCollateral = account.sumCollateral.toString();
      // this.repayInfo.sumBorrowPlusEffects = account.sumBorrowPlusEffects.toString();
    },
    setMaxLiquidate(accountId, token){
      this.liquidateInfo.maxLiquidate = window.pool.getLiqudationMax(accountId, token);
    },
    liquidate(liquidateInfo){
      window.pool.liquidate(liquidateInfo.account, liquidateInfo.token, parseFloat(liquidateInfo.value), liquidateInfo.token2, liquidateInfo.account2);
      this.updateResults();
      this.history.push(`аккаунт №${liquidateInfo.account2 + 1} ликвидировал займ ${ liquidateInfo.token2} на сумму ${liquidateInfo.token} ${liquidateInfo.value} аккаунту №${liquidateInfo.account + 1}`);
    },
    // setLiquidateccountInfo(accountIndex){
    //   let account = window.pool.getInfo(this.pricesFormat).accounts[accountIndex];
    //   console.log(account.borrows);
    //   console.log(account.borrows.value.toString());
    //   // account
    //   this.liquidateInfo.depositsToken = account.deposits
    //   this.liquidateInfo.deposits = account.deposits.toString();
    //   this.liquidateInfo.sumCollateral = account.sumCollateral.toString();
    //   this.liquidateInfo.sumBorrowPlusEffects = account.sumBorrowPlusEffects.toString();
    // },
    setMaxToMint(accountId, token){
      this.mintInfo.maxMint = window.pool.getMaxMint(accountId, token);
    },
    mint(mintInfo){
      window.pool.mint(mintInfo.account, { name: mintInfo.token, borrowAmount: parseFloat(mintInfo.value) });
      this.history.push(`аккаунт №${mintInfo.account + 1} выпустил стейбл коины на сумму ${mintInfo.token} ${mintInfo.value}`);
      this.updateResults();
    },
    trade(tradeInfo){
      console.log(tradeInfo.account, [`${tradeInfo.token}/${tradeInfo.token2}`, parseFloat(tradeInfo.value)]);
      const trade1 = window.pool.tradePool(tradeInfo.account, [`${tradeInfo.token}/${tradeInfo.token2}`, parseFloat(tradeInfo.value)]);
      this.updateResults();
      console.log(trade1);
      this.$buefy.toast.open(`вы получили ${trade1.name} ${trade1.value.toString()}`)
      this.history.push(`аккаунт №${tradeInfo.account + 1} обменял ${tradeInfo.token} / ${tradeInfo.token2} на сумму ${tradeInfo.value} (получил ${trade1.name} ${trade1.value.toString()})`);
    },

  },
  created(){
    this.Create();
  }

}
</script>

<style lang="sass">
  @import "vue-select/src/scss/vue-select.scss"

  .home
    min-height: calc(100vh - 170px)
    // background: red
  .fullHeight
    height: 50%
  .modal-content-height
    min-height: 50vh
  .history
    overflow: scroll
    max-height: 500px
    text-align: left
</style>