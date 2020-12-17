<template>
  <div class="home py-6">
    <div class="columns fullHeight">
      <div class="column">
        <cmp-form :form="form1" title="Пул">
        </cmp-form>
        <b-field label="prices:"
            grouped group-multiline>
          <div v-for="item in poolPrices" :key="item.name" class="control">
            <b-taglist attached>
              <b-tag type="is-primary is-light" size="is-medium">{{item.name}}</b-tag>
              <b-tag type="is-primary" size="is-medium">{{item.value}}</b-tag>
            </b-taglist>
           </div>
          <b-button 
            type="is-primary" outlined
            size="is-small"
            icon-left="plus"
            @click="addNewPriceModal = true"></b-button>
          <b-button 
            type="is-primary"
            size="is-small"
            icon-left="border-color"
            class="ml-3"
            @click="priceModal = true">
          </b-button>
        </b-field>
      </div>
      <div class="column">
        <cmp-accounts-form
            :tokenOptions="[...config.tokens, config.stable]"
            :pricesFormat="poolPricesFormat"
            title="Аккаунты">
        </cmp-accounts-form>
      </div>
      <div class="column">

        <h2 class="is-size-4 mb-3">Операции</h2>
        <div class="columns is-multiline">

          <div class="column is-full">
            <b-button expanded type="is-primary"
              @click="simulation()">Запуск симуляции</b-button>
          </div>

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

          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
            @click="repayStableModal = true">Вернуть стейбл коины </b-button>
          </div>

          <div class="column is-half">
            <b-button expanded type="is-primary" outlined
            @click="liquidateStableModal = true">Ликвидация стейбл</b-button>
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
        <b-table :data="this.table" >

          <b-table-column field="name" label="name" v-slot="props">
              {{ props.row.name }}
          </b-table-column>
          <b-table-column field="value" label="value" v-slot="props">
              {{ props.row.value }}
          </b-table-column>
          <b-table-column field="totalBorrows" label="totalBorrows" v-slot="props">
              {{ props.row.totalBorrows }}
          </b-table-column>
          <b-table-column field="borrowIndex" label="borrowIndex" v-slot="props">
              {{ props.row.borrowIndex }}
          </b-table-column>
          <b-table-column field="totalReserves" label="totalReserves" v-slot="props">
              {{ props.row.totalReserves }}
          </b-table-column>
          <b-table-column field="price" label="price" v-slot="props">
              {{ props.row.price }}
          </b-table-column>
          <b-table-column field="capital" label="capital" v-slot="props">
            <span v-if="props.row.name!='summ'">
              {{ props.row.capital }}
            </span>
            <b v-else>
              {{ props.row.capital }}
            </b>
          </b-table-column>
          <b-table-column field="weight" label="weight" v-slot="props">
              {{ props.row.weight }}
          </b-table-column>
          <b-table-column field="staked" label="staked" v-slot="props">
              {{ props.row.staked }}
          </b-table-column>
          <b-table-column field="prevDay" label="prevDay" v-slot="props">
              {{ props.row.prevDay }}
          </b-table-column>
          <b-table-column field="utilizationRate" label="utilizationRate" v-slot="props">
              {{ props.row.utilizationRate }}
          </b-table-column>
          <b-table-column field="borrowRate" label="borrowRate" v-slot="props">
              {{ props.row.borrowRate }}
          </b-table-column>
          <!-- <b-table-column field="supplyRate" label="supplyRate" v-slot="props">
              {{ props.row.supplyRate }}
          </b-table-column> -->
        </b-table> 
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
          <b-button expanded type="is-primary" 
            class="mt-4"
            :disabled="JSON.stringify(prices) == JSON.stringify(poolPrices)"
            @click="setPricesArray(prices), priceModal = false">Изменить</b-button>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="addNewPriceModal" :width="440">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <cmp-form :form="newPrice" title="new price">
          </cmp-form>
          <b-checkbox class="mt-2" v-model="checkboxNewPrice">
            стейбл коин
          </b-checkbox>
          <b-button expanded type="is-primary" 
            class="mt-4"
            :disabled="this.newPriceBtnDis"
            @click="addNewPrice(newPrice), addNewPriceModal = false">Добавить</b-button>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="createDepositModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Сделать депозит</h2>
            <div class="columns is-multiline">
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="createDepositInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setCreateDepositOptions(parseInt(index))">
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">token</h2>
                <b-input type="number" class="is-flex-grow-2 mb-3" v-model="createDepositInfo.value" ></b-input>
                <template v-if="poolAccounts[createDepositInfo.account]">
                  <div v-for="(item, index) in poolAccounts[createDepositInfo.account].balance"
                      :key="index">
                    <b-radio 
                        v-model="createDepositInfo.token"
                        name="token"
                        :native-value="index"
                        @click.native="setCreateDepositValue(index)">
                        {{index}} 
                        <b-tooltip :label="item.toString()"
                          position="is-bottom">
                          {{item.toString().split('.')[0]}}{{item.toString().split('.')[1]?'.'+item.toString().split('.')[1].slice(0, 4):''}}
                        </b-tooltip>
                    </b-radio>
                  </div>
                </template>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">Внести {{createDepositInfo.tokenInput}}<br> 
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
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
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
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">xToken</h2>
                <b-input type="number" class="is-flex-grow-2 mb-3" v-model="returnDepositInfo.value" ></b-input>
                <div v-for="(item, index) in returnDepositInfo.options"
                    :key="index">
                  <b-radio 
                      v-model="returnDepositInfo.token"
                      name="token"
                      :native-value="item.name">
                      {{item.name}}
                      <b-tooltip :label="item.value.toString()"
                        position="is-bottom">
                        {{item.value.toString().split('.')[0]}}{{item.value.toString().split('.')[1]?'.'+item.value.toString().split('.')[1].slice(0, 4):''}}
                      </b-tooltip>
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">Вывести {{returnDepositInfo.tokenInput}}<br> 
                {{returnDepositInfo.token}} от аккаунта №{{returnDepositInfo.account+1}} на личный баланс</h2>
                <b-button expanded type="is-primary" outlined
                  :disabled="poolAccounts.length == 0 || returnDepositInfo.value == '0' || returnDepositInfo.value == ''"
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
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="borrowInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setReturnOptions(), setReturnMaxBorrow(parseInt(index), borrowInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6 mb-3">you get ( max -
                  <b-tooltip :label="borrowInfo.maxBorrow.toString()"
                    position="is-bottom">
                    {{borrowInfo.maxBorrow.toString().split('.')[0]}}{{borrowInfo.maxBorrow.toString().split('.')[1]?'.'+borrowInfo.maxBorrow.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip>)
                </h2>
                <b-input type="number" class="is-flex-grow-2 mb-3" v-model="borrowInfo.value" ></b-input>

                <div v-for="(item, index) in pricesOptions"
                    :key="index">
                  <b-radio 
                      v-model="borrowInfo.token"
                      name="token1"
                      :native-value="item"
                      @click.native="setReturnMaxBorrow(borrowInfo.account, item)">
                      {{item}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6 mb-3">Обеспеченность займа: 200% </h2>
                <h2 class="is-size-6 mb-3">Занять <br>
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
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="mintInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setMaxToMint(parseInt(index), mintInfo.token), setMintOptions()"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">you get (max - 
                  <b-tooltip :label="mintInfo.maxMint.toString()"
                    position="is-bottom">
                    {{mintInfo.maxMint.toString().split('.')[0]}}{{mintInfo.maxMint.toString().split('.')[1]?'.'+mintInfo.maxMint.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip>)</h2>
                <b-input type="number" class="is-flex-grow-2 mb-3" v-model="mintInfo.value" ></b-input>

                <div v-for="(item, index) in stable"
                    :key="index">
                  <b-radio 
                      v-model="mintInfo.token"
                      name="token1"
                      :native-value="item"
                      @click.native="setMaxToMint(mintInfo.account, item)">
                      {{item}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">
                 Выпустить для аккаунта №{{mintInfo.account+1}} {{mintInfo.token}}
                    <b-tooltip :label="mintInfo.value.toString()"
                      position="is-bottom">
                      {{mintInfo.value.toString().split('.')[0]}}{{mintInfo.value.toString().split('.')[1]?'.'+mintInfo.value.toString().split('.')[1].slice(0, 4):''}}
                    </b-tooltip> </h2>
                <b-button expanded type="is-primary" outlined
                  :disabled="poolAccounts.length == 0 || mintInfo.value == '' || parseFloat(mintInfo.value) == 0 || parseFloat(mintInfo.maxMint) < parseFloat(mintInfo.value)"
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
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="tradeInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setTradeOptions(parseInt(index)), setTradeValue(parseInt(index), tradeInfo.token), setTradeResult(parseInt(index), tradeInfo.token, tradeInfo.token2, tradeInfo.value)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-6">

                <div class="columns">

                  <div class="column is-8">
                    <h2 class="is-size-6 mb-3">you pay</h2>
                    <b-input type="number" class="is-flex-grow-2 mb-3" v-model="tradeInfo.value" @input="(value)=>setTradeResult(tradeInfo.account, tradeInfo.token, tradeInfo.token2, value)"></b-input>
                    <template v-if="poolAccounts[tradeInfo.account]">
                      <div v-for="(item, index) in poolAccounts[tradeInfo.account].balance"
                          :key="index">
                        <b-radio 
                            v-model="tradeInfo.token"
                            name="token1"
                            :native-value="index"
                            @click.native="setTradeValue(tradeInfo.account, index), setTradeResult(tradeInfo.account, index, tradeInfo.token2, tradeInfo.value)">
                            {{index}}
                            <b-tooltip :label="item.toString()"
                              position="is-bottom">
                              {{item.toString().split('.')[0]}}{{item.toString().split('.')[1]?'.'+item.toString().split('.')[1].slice(0, 4):''}}
                            </b-tooltip>
                        </b-radio>
                      </div>
                    </template>
                  </div>
                  <div class="column is-4">

                    <h2 class="is-size-6 mb-3">you get</h2>
                    <h2 class="is-size-6 mb-3" :style="{width: '100%', height: '40px'}">
                      <b-tooltip :label="tradeInfo.value2.toString()"
                        position="is-bottom">
                        {{tradeInfo.value2.toString().split('.')[0]}}{{tradeInfo.value2.toString().split('.')[1]?'.'+tradeInfo.value2.toString().split('.')[1].slice(0, 4):''}}
                      </b-tooltip>
                    </h2>
                    
                    <div v-for="(item, index) in pricesOptions"
                        :key="index">
                      <b-radio 
                          v-model="tradeInfo.token2"
                          name="token2"
                          :native-value="item"
                          @click.native="setTradeResult(tradeInfo.account, tradeInfo.token, item,  tradeInfo.value)">
                          {{item}}
                      </b-radio>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-4">
                <h2 class="is-size-6 mb-3">
                  Обменять для аккаунта  №{{tradeInfo.account+1}} {{tradeInfo.token}} 
                  <b-tooltip :label="tradeInfo.value.toString()"
                    position="is-bottom">
                    {{tradeInfo.value.toString().split('.')[0]}}{{tradeInfo.value.toString().split('.')[1]?'.'+tradeInfo.value.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip>
                  на {{tradeInfo.token2}} 
                  <b-tooltip :label="tradeInfo.value2.toString()"
                    position="is-bottom">
                    {{tradeInfo.value2.toString().split('.')[0]}}{{tradeInfo.value2.toString().split('.')[1]?'.'+tradeInfo.value2.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip>
                </h2>
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
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="repayInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setRepayAccountInfo(parseInt(index)), setRepayValue(parseInt(index), repayInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">token</h2>
                <b-input type="text" class="is-flex-grow-2 mb-3" v-model="repayInfo.value" ></b-input>
                <div v-for="(item, index) in repayInfo.borrows"
                    :key="index">
                  <b-radio 
                      v-model="repayInfo.token"
                      name="token"
                      :native-value="item.name"
                      @click.native="setRepayValue(repayInfo.account, item.name)"
                      >
                      {{item.name}} - 
                      <b-tooltip :label="item.value.toString()"
                        position="is-bottom">
                        {{item.value.toString().split('.')[0]}}{{item.value.toString().split('.')[1]?'.'+item.value.toString().split('.')[1].slice(0, 4):''}}
                      </b-tooltip>
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-1">к возврату: {{repayInfo.sumBorrowPlusEffects }} ETH</h2>
                <h2 class="is-size-6 mb-1">обеспечение: {{repayInfo.sumCollateral}} BTC</h2>
                <h3 class="is-size-8 mb-3">
                  Вернуть займ аккаунта №{{repayInfo.account+1}} в размере
                    <b-tooltip :label="repayInfo.value.toString()"
                      position="is-bottom">
                      {{repayInfo.value.toString().split('.')[0]}}{{repayInfo.value.toString().split('.')[1]?'.'+repayInfo.value.toString().split('.')[1].slice(0, 4):''}}
                    </b-tooltip>
                   {{repayInfo.token}} <br>
                </h3>
                <b-button expanded type="is-primary" outlined
                  :disabled="poolAccounts.length == 0 || repayInfo.borrows.length == 0 || repayInfo.token == '' || repayInfo.value == '' || parseFloat(repayInfo.value) == 0"
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
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="liquidateInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setLiqidateOptions1(parseInt(index), parseInt(liquidateInfo.account2)), setLiqidateOptions(parseInt(index)), setMaxLiquidate(parseInt(index), liquidateInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">token max(
                  <b-tooltip :label="liquidateInfo.maxLiquidate.toString()"
                    position="is-bottom">
                    {{liquidateInfo.maxLiquidate.toString().split('.')[0]}}{{liquidateInfo.maxLiquidate.toString().split('.')[1]?'.'+liquidateInfo.maxLiquidate.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip>)
                </h2>
                <b-input type="text" class="is-flex-grow-2 mb-3" v-model="liquidateInfo.value" ></b-input>
                <div v-for="(item, index) in liquidateInfo.options1"
                    :key="index">
                  <b-radio 
                      v-model="liquidateInfo.token"
                      name="token"
                      :native-value="item"
                      @click.native="setMaxLiquidate(liquidateInfo.account, item)"
                      >
                      {{item}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account2</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="liquidateInfo.account2"
                      name="account2"
                      :native-value="parseInt(index)"
                      @click.native="setLiqidateOptions(parseInt(liquidateInfo.account), parseInt(index))"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">token2</h2>
                  <div v-for="(item, index) in liquidateInfo.options"
                      :key="index">
                    <b-radio 
                        v-model="liquidateInfo.token2"
                        name="token2"
                        :native-value="item"
                        >
                        {{item}}
                    </b-radio>
                  </div>
              </div>
              <div class="column is-4">
                <h3 class="is-size-8 mb-3">
                  Ликвидировать займ аккаунта №{{liquidateInfo.account+1}} 
                  и перевести {{liquidateInfo.token}} в пул
                </h3>
                <b-button expanded type="is-primary" outlined
                  :disabled="poolAccounts.length == 0 || liquidateInfo.token == '' || liquidateInfo.token2 == '' || liquidateInfo.options1.length == 0 || liquidateInfo.options == 0 || liquidateInfo.value == '' || parseFloat(liquidateInfo.value) == 0"
                 @click="liquidate(liquidateInfo), liquidateModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="repayStableModal" :width="640">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Вернуть стейбл коины</h2>
            <div class="columns is-multiline">
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="repayStableInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setRepayStableAccountInfo(parseInt(index)), setRepayStableValue(parseInt(index), repayStableInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h2 class="is-size-6 mb-3">token</h2>
                <b-input type="text" class="is-flex-grow-2 mb-3" v-model="repayStableInfo.value" ></b-input>
                <div v-for="(item, index) in repayStableInfo.borrows"
                    :key="index">
                  <b-radio 
                      v-model="repayStableInfo.token"
                      name="token"
                      :native-value="item.name"
                      @click.native="setRepayStableValue(repayStableInfo.account, item.name)"
                      >
                      {{item.name}} - 
                      <b-tooltip :label="item.value.toString()"
                        position="is-bottom">
                        {{item.value.toString().split('.')[0]}}{{item.value.toString().split('.')[1]?'.'+item.value.toString().split('.')[1].slice(0, 4):''}}
                      </b-tooltip>
                  </b-radio>
                </div>
              </div>
              <div class="column is-5">
                <h3 class="is-size-8 mb-3">
                  Вернуть стейбл коины аккаунта №{{repayStableInfo.account+1}}
                  
                  <b-tooltip :label="repayStableInfo.value.toString()"
                    position="is-bottom">
                    {{repayStableInfo.value.toString().split('.')[0]}}{{repayStableInfo.value.toString().split('.')[1]?'.'+repayStableInfo.value.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip> {{repayStableInfo.token}} <br>
                </h3>
                <b-button expanded type="is-primary" outlined
                  :disabled="poolAccounts.length == 0 || repayStableInfo.borrows.length == 0 || repayStableInfo.token == '' || repayStableInfo.value == '' || parseFloat(repayStableInfo.value) == 0"
                  @click="repayStable(repayStableInfo), repayStableModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-modal v-model="liquidateStableModal" :width="740">
      <div class="modal-card modal-content-height" style="width: auto">
        <section class="modal-card-body">
          <h2 class="is-size-4 mb-3">Ликвидация стейбл коинов</h2>
            <div class="columns is-multiline">
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="liquidateStableInfo.account"
                      name="account"
                      :native-value="parseInt(index)"
                      @click.native="setLiqidateStableOptions1(parseInt(index)), setLiqidateStableOptions(parseInt(index), parseInt(liquidateStableInfo.account2)), setMaxLiquidateStable(parseInt(index), liquidateStableInfo.token)"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                
                <h2 class="is-size-6 mb-3">token max(
                  <b-tooltip :label="liquidateStableInfo.maxLiquidate.toString()"
                    position="is-bottom">
                    {{liquidateStableInfo.maxLiquidate.toString().split('.')[0]}}{{liquidateStableInfo.maxLiquidate.toString().split('.')[1]?'.'+liquidateStableInfo.maxLiquidate.toString().split('.')[1].slice(0, 4):''}}
                  </b-tooltip>)
                </h2>

                <b-input type="text" class="is-flex-grow-2 mb-3" v-model="liquidateStableInfo.value" ></b-input>
                <div v-for="(item, index) in liquidateStableInfo.options1"
                    :key="index">
                  <b-radio 
                      v-model="liquidateStableInfo.token"
                      name="token"
                      :native-value="item"
                      @click.native="setMaxLiquidateStable(liquidateStableInfo.account, item)"
                      >
                      <!-- @click.native="setMaxLiquidate(liquidateStableInfo.account, item)" -->
                      {{item}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">account2</h2>
                <div v-for="(item, index) in poolAccounts"
                    :key="index">
                  <b-radio 
                      v-model="liquidateStableInfo.account2"
                      name="account2"
                      :native-value="parseInt(index)"
                      @click.native="setLiqidateStableOptions(parseInt(liquidateStableInfo.account), parseInt(index))"
                      >
                      №{{parseInt(index)+1}}
                  </b-radio>
                </div>
              </div>
              <div class="column is-2">
                <h2 class="is-size-6 mb-3">token2</h2>
                  <div v-for="(item, index) in liquidateStableInfo.options"
                      :key="index">
                    <b-radio 
                        v-model="liquidateStableInfo.token2"
                        name="token2"
                        :native-value="item"
                        >
                        {{item}}
                    </b-radio>
                  </div>
              </div>
              <div class="column is-4">
                <h3 class="is-size-8 mb-3">
                  Ликвидировать стейбл коины аккаунта №{{liquidateStableInfo.account+1}} 
                  и перевести {{liquidateStableInfo.token}} в пул
                </h3>
                <b-button expanded type="is-primary" outlined
                  :disabled="poolAccounts.length == 0 || liquidateStableInfo.token == '' || liquidateStableInfo.token2 == '' || liquidateStableInfo.options1.length == 0 || liquidateStableInfo.options == 0 || liquidateStableInfo.value == '' || parseFloat(liquidateStableInfo.value) == 0"
                  @click="liquidateS(liquidateStableInfo), liquidateStableModal = false">Подтвердить</b-button>
              </div>
            </div>
        </section>
      </div>
    </b-modal>
    <b-loading :is-full-page="true" v-model="isLoading" :can-cancel="false">
    </b-loading>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import config from '@/assets/NeuronES6/config.js'


// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import Form from '@/components/Form.vue'
import AccountsForm from '@/components/AccountsForm.vue'

export default {
  name: 'Home',
  components: {
    'cmp-form': Form,
    'cmp-accounts-form': AccountsForm
  },
  data() {
    return {
      capital: 0,
      simulationAccountStart: 0,
      simulationTickTimer: 0,
      isLoading: false,
      tickDisble: true,
      tokenModal: false,
      priceModal: false,
      addNewPriceModal: false,
      checkboxNewPrice: false,
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
        maxBorrow: 0,
      },
      mintModal: false,
      mintInfo: {
        account: 0,
        value: 0,
        token: '',
        maxMint: 0,
      },
      tradeModal: false,
      tradeInfo: {
        account: 0,
        value: 0,
        value2: 0,
        token: '',
        token2: '',
        // options: config.tokens,
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
        options1: [],
        options: [],
        borrows: 0,
        token: '',
        token2: '',
      },
      repayStableModal: false,
      repayStableInfo: {
        account: 0,
        value: 0,
        getValue: 0,
        borrows: [],
        token: '',
        depositsToken: '',
        sumCollateral: 0,
        sumBorrowPlusEffects: 0,
      },
      liquidateStableModal: false,
      liquidateStableInfo: {
        account: 0,
        account2: 0,
        value: 0,
        maxLiquidate: 0,
        options1: [],
        options: [],
        borrows: 0,
        token: '',
        token2: '',
      },
      form1: [
        {
          name: 'tokens',
          value: config.tokens,
          options: [],
          tooltip: 'Изменить список токенов в пуле',
        },
        {
          name: 'stable',
          value: config.stable,
          options: [],
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
          name: 'baseMultiplier',
          value: config.baseMultiplier,
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
      ],
      newPrice: [
      ],

      history: [
        
      ],
    }
  },
  computed: {
    ...mapState('accounts', {'poolAccounts': 'poolAccounts'}),
    ...mapGetters('accounts', {'accountsChecked': 'itemsChecked'}),
    ...mapState('prices', ['poolPrices', 'stable']),
    ...mapGetters('prices', ['poolPricesFormat', 'pricesOptions']),
    columns(){ 
      return [
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
      ];
    },
    newPriceBtnDis(){
      let test = false;
      this.newPrice.forEach(item=>{
        if(item.value == ''){
          test = true
        }
      })
      return test
    },
    config(){
      let configLocal = {}
      this.form1.forEach(item => {
        configLocal[item.name] = item.value;
      });
      return configLocal
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
    config(val){
      window.pool.createPool({...val, prices: this.poolPricesFormat} );
      window.oracle.init({...val, prices: this.poolPricesFormat}  );
    },
    priceModal(val){
      if (val){
        this.poolPrices.forEach(item => {
          this.prices.push(Object.assign({}, item));
        })
      } else {
        this.prices = [];
      }
    },
    pricesOptions(val){
      this.form1.forEach((item, index) => {
        if (item.name == 'tokens') {
          this.$set(this.form1, index, Object.assign({}, this.form1[index], { options: val }))
          // this.form1[index] = Object.assign({}, this.form1[index], { options: val.filter(x => !this.stable.includes(x)) })
        }
      })
    },
    stable(val){
      this.form1.forEach((item, index) => {
        if (item.name == 'stable') {
          this.$set(this.form1, index, Object.assign({}, this.form1[index], { options: val }))
          // this.form1[index] = Object.assign({}, this.form1[index], { options: val })
        }
      })
    },
    addNewPriceModal(val){
      if (val){
        this.newPrice.push({
          name: 'name',
          value: '',
        })
        this.newPrice.push({
          name: 'rate',
          value: '',
        })
      } else {
        this.newPrice = [];
        this.checkboxNewPrice = false;
      }
    },
    history(){
      this.$refs.history.scrollTo({
        top: this.$refs.history.scrollHeight,
        behavior: "smooth"
      });
    },
    createDepositModal(val){
      if (val){
        this.setCreateDepositOptions(0);
      }
    },
    returnDepositModal(val){
      if (val){
        this.setReturnOptionToDeposit(this.returnDepositInfo.account);
      }
    },
    tradeModal(val){
      if (val){
        this.setTradeOptions(0);
        this.setTradeValue(this.tradeInfo.account, this.tradeInfo.token)
      }
    },
    borrowModal(val){
      if (val){
        this.setReturnOptions();
        this.setReturnMaxBorrow(this.borrowInfo.account, this.borrowInfo.token);
      }
    },
    mintModal(val){
      if (val){
        this.setMintOptions();
        this.setMaxToMint(parseInt(this.mintInfo.account), this.mintInfo.token);
      }
    },
    repayModal(val){
      if (val){
        this.setRepayAccountInfo(this.repayInfo.account);
        this.setRepayValue(this.repayInfo.account, this.repayInfo.token);
      }
    },
    liquidateModal(val){
      if (val){
        this.setLiqidateOptions1(this.liquidateInfo.account, this.liquidateInfo.account2)
        this.setLiqidateOptions(this.liquidateInfo.account)
        this.setMaxLiquidate(this.liquidateInfo.account, this.liquidateInfo.token);
      }
    },
    repayStableModal(val){
      if (val){
        this.setRepayStableAccountInfo(this.repayStableInfo.account);
        this.setRepayStableValue(this.repayStableInfo.account, this.repayStableInfo.token);
      }
    },
    liquidateStableModal(val){
      if (val){
        // this.setMaxLiquidate(this.liquidateInfo.account, this.liquidateInfo.token);
        this.setLiqidateStableOptions1(this.liquidateStableInfo.account)
        this.setLiqidateStableOptions(this.liquidateStableInfo.account, this.liquidateStableInfo.account2)
      }
    },
  },
  methods: {
    ...mapActions('accounts', ['updateAccounts', 'addBalanceToAccount']),
    ...mapMutations('prices', ['setPrices', 'addStable']),
    ...mapActions('prices', ['setPricesArray']),

    addNewPrice(newPrice){
      this.setPricesArray([...this.poolPrices, {name: newPrice[0].value, value: newPrice[1].value}])
      if (this.checkboxNewPrice){
        this.addStable(newPrice[0].value);
      }
    },
    updateResults(){
      let getInfo = window.pool.getInfo(this.poolPricesFormat)
      this.capital = getInfo.capital.toString();
      this.table = [];
      let reserves = getInfo.reserves;
      this.updateAccounts(this.poolPricesFormat);
      // this.updatePrices(this.poolPricesFormat);
      
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
              // console.log(key2)
            }
          }
          this.table.push(element)
        }
      }
      const last = {
        name: 'summ',
        value: '',
        totalBorrows: '',
        borrowIndex: '',
        totalReserves: '',
        price: '',
        capital: this.capital,
        weight: '',
        staked: '',
        prevDay: '',
        utilizationRate: '',
        borrowRate: '',
        supplyRate: '',

      }
      this.table.push(last)
      // console.log( this.table );
    },
    nextTick(){
      window.pool.tick(1);
      this.updateResults();
      this.history.push('pool tick');
    },
    simulationTick(callback, data){
      this.simulationTickTimer++;
      setTimeout(()=>{  
        // console.log(callback, data);
        callback(data)
      }, this.simulationTickTimer * 100)
      // console.log(this.simulationTickTimer * 100);
    },
    simulationTickData(callback, data, dataGet){
      this.simulationTickTimer++;
      setTimeout(()=>{  
        let newData ={}
        for (const key in dataGet) {
          if ( Object.prototype.hasOwnProperty.call(dataGet, key)) {
            newData[key] = eval(dataGet[key]);
          }
        }
        callback({...data, ...newData})
      }, this.simulationTickTimer * 100)
    },
    simulationEnd(val){
      this.isLoading = val;
    },
    simulation(){
      this.isLoading = true;

      const arr2 = [0, 1, 2, 3, 4];
      if (this.simulationAccountStart == 0){
        this.simulationAccountStart = this.poolAccounts.length;
      }
      this.simulationTick(this.addBalanceToAccount, { 
        i: 0 + this.simulationAccountStart,
        data: {
          BTC: 10,
          ETH: 200,
        }, 
        pricesFormat: {...this.poolPricesFormat}
      })


      this.simulationTick(this.addBalanceToAccount, { 
        i: 1 + this.simulationAccountStart,
        data: {
          BTC: 20,
          EOS: 180,
        }, 
        pricesFormat: this.poolPricesFormat
      })

      this.simulationTick(this.addBalanceToAccount, { 
        i: 2 + this.simulationAccountStart,
        data: {
          ETH: 180,
          USDT: 20,
        }, 
        pricesFormat: this.poolPricesFormat
      })

      this.simulationTick(this.addBalanceToAccount, { 
        i: 3 + this.simulationAccountStart,
        data: {
          BTC: 20,
          EOS: 2200,
          USDT: 210,
        }, 
        pricesFormat: this.poolPricesFormat
      })

      this.simulationTick(this.createDeposit, { 
        account: 0 + this.simulationAccountStart,
        token: "BTC",
        value: "10",
      })
      this.simulationTick(this.createDeposit, { 
        account: 0 + this.simulationAccountStart,
        token: "ETH",
        value: "100",
      })
      this.simulationTick(this.createDeposit, { 
        account: 1 + this.simulationAccountStart,
        token: "BTC",
        value: "10",
      })

      this.simulationTick(this.createDeposit, { 
        account: 1 + this.simulationAccountStart,
        token: "EOS",
        value: "180",
      })

      this.simulationTick(this.createDeposit, { 
        account: 2 + this.simulationAccountStart,
        token: "ETH",
        value: "180",
      })

      this.simulationTick(this.createDeposit, { 
        account: 2 + this.simulationAccountStart,
        token: "USDT",
        value: "20",
      })
      this.simulationTick(this.createDeposit, { 
        account: 3 + this.simulationAccountStart,
        token: "EOS",
        value: "1800",
      })

      this.simulationTick(this.createDeposit, { 
        account: 3 + this.simulationAccountStart,
        token: "BTC",
        value: "10",
      })

      this.simulationTick(this.borrow, { 
        account: 0 + this.simulationAccountStart,
        token: "ETH",
        value: "100",
      })

      this.simulationTick(this.borrow, { 
        account: 1 + this.simulationAccountStart,
        token: "EOS",
        value: "30",
      })
      this.simulationTick(this.mint, { 
        account: 1 + this.simulationAccountStart,
        token: "sUSD",
        value: "300",
      })
      arr2.forEach(()=>{
        this.nextTick();
        this.simulationTick(this.nextTick, { 
        })
      })
      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "ETH",
        token2: "EOS",
        value: "10",
      })
      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "ETH",
        token2: "BTC",
        value: "100",
      })

      this.simulationTick(this.trade, { 
        account: 1 + this.simulationAccountStart,
        token: "EOS",
        token2: "BTC",
        value: "30",
      })
      this.simulationTick(this.trade, { 
        account: 1 + this.simulationAccountStart,
        token: "BTC",
        token2: "ETH",
        value: "0.03",
      })

      arr2.forEach(()=>{
        this.nextTick();
        this.simulationTick(this.nextTick, { 
        })
      })

      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "EOS",
        token2: "ETH",
        value: "100",
      })
      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "BTC",
        token2: "ETH",
        value: "1",
      })
      this.simulationTick(this.trade, { 
        account: 1 + this.simulationAccountStart,
        token: "BTC",
        token2: "ETH",
        value: "1",
      })
      this.simulationTick(this.trade, { 
        account: 2 + this.simulationAccountStart,
        token: "ETH",
        token2: "BTC",
        value: "10",
      })

      arr2.forEach(()=>{
        this.simulationTick(this.nextTick, { 
        })
      })

      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "ETH",
        token2: "BTC",
        value: "50",
      })
      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "BTC",
        token2: "ETH",
        value: "0.5",
      })
      this.simulationTick(this.trade, { 
        account: 2 + this.simulationAccountStart,
        token: "BTC",
        token2: "ETH",
        value: "3",
      })
      this.simulationTick(this.trade, { 
        account: 0 + this.simulationAccountStart,
        token: "BTC",
        token2: "ETH",
        value: "1",
      })
      arr2.forEach(()=>{
        this.simulationTick(this.nextTick, { 
        })
      });
      this.simulationTickData(
        this.repay, 
        { 
          account: 0 + this.simulationAccountStart,
          token: "ETH",
        },
        {
          value: `window.pool.getInfo(this.poolPricesFormat).accounts[${0+this.simulationAccountStart}].borrows.ETH.value`
        }
      );

      this.simulationTickData(
        this.liquidate, 
        { 
          account: 1 + this.simulationAccountStart,
          account2: 3 + this.simulationAccountStart,
          token: "EOS",
          token2: "BTC",
        }, 
        {
          value: `window.pool.getInfo(this.poolPricesFormat).accounts[${1+this.simulationAccountStart}].borrows.EOS.value`,
        }
      );

      arr2.forEach(()=>{
        this.simulationTick(this.nextTick, { 
        })
      });

      this.simulationTick(this.repayStable, { 
        account: 2 + this.simulationAccountStart,
        token: "sUSD",
        value: 1000,
      });

      this.simulationTick(this.liquidateS, { 
        account: 1 + this.simulationAccountStart,
        account2: 3 + this.simulationAccountStart,
        token: "sUSD",
        token2: "EOS",
        value: 300,
      });

      this.simulationTick(this.simulationEnd, false);
      // console.log('test');
      // this.simulationTick(()=>{
      //   this.isLoading = false;
      // }, {})
    },

    setCreateDepositOptions(val){
      const balance = this.poolAccounts[val].balance;
      let test = true;
      for (let key in balance) {
        if (test){
          this.createDepositInfo.token = key;
          this.createDepositInfo.value = balance[key].toString();
        }
        test = false;
      }
    },
    setCreateDepositValue(val){
      this.createDepositInfo.value = this.poolAccounts[this.createDepositInfo.account].balance[val].toString();
    },
    createDeposit(createDepositInfo){
      window.pool.deposit(createDepositInfo.account, { name: createDepositInfo.token, value: parseFloat(createDepositInfo.value) });
      this.updateResults();

      this.history.push(`создан депозит для аккаунта №${createDepositInfo.account + 1} на сумму ${createDepositInfo.token} ${createDepositInfo.value}`);
    },
    setReturnOptionToDeposit(val){
      let deposits= window.pool.accounts.get(val).deposits;
      
      let options = []
      for (let key in deposits) {
        options.push({
          name: key,
          value: deposits[key].value.toString()
        })
      }
      this.$set( this.returnDepositInfo, 'options', options )
      this.$set( this.returnDepositInfo, 'token', options[0].name )
      this.$set( this.returnDepositInfo, 'value', options[0].value )
    },
    returnDeposit(returnDepositInfo){
      const test = window.pool.redeem(returnDepositInfo.account, returnDepositInfo.token, parseFloat(returnDepositInfo.value) );
      this.updateResults();
      if (test.error) {
        this.$buefy.toast.open({
          message: `Ошибка вывода средств! ${test.error.message}`,
          type: 'is-danger'
        })
        this.history.push(`ошибка возврата депозита для аккаунта №${returnDepositInfo.account + 1} на сумму ${returnDepositInfo.token} ${returnDepositInfo.value}`);
      } else {
        this.history.push(`возврат депозита для аккаунта №${returnDepositInfo.account + 1} на сумму ${returnDepositInfo.token} ${returnDepositInfo.value}`);
      }
    },
    setReturnOptions(){
      this.borrowInfo.token = this.borrowInfo.options[0];
    },
    setReturnMaxBorrow(val, val2){
      // maxBorrow
      // console.log('getMaxBorrow', window.pool.getMaxBorrow(val, val2).toString());
      this.borrowInfo.maxBorrow = window.pool.getMaxBorrow(val, val2).toString();
      this.borrowInfo.value = this.borrowInfo.maxBorrow;
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
      const test = window.pool.repay(repayInfo.account, repayInfo.token, parseFloat(repayInfo.value));

      if (test){
        this.history.push(`аккаунт №${repayInfo.account + 1} вернул займ на сумму ${repayInfo.token} ${repayInfo.value}`);
      } else {
        this.$buefy.toast.open({
          message: `Ошибка! Возврат займа не прошёл!`,
          type: 'is-danger'
        })
        this.history.push(`Не удачная попытка вернуть займ аккаунта №${repayInfo.account + 1} на сумму ${repayInfo.token} ${repayInfo.value}`);
      }      
      this.updateResults();
    },
    setRepayAccountInfo(accountIndex){
      let account = window.pool.getInfo(this.poolPricesFormat).accounts[accountIndex];
      this.repayInfo.borrows = []
      for (const key in account.borrows) {
        if (Object.prototype.hasOwnProperty.call(account.borrows, key)) {
          this.repayInfo.borrows.push({
            name: key,
            value: account.borrows[key].value?account.borrows[key].value.toString(): '',
          })
        }
      }
      this.repayInfo.token = this.repayInfo.borrows[0].name?this.repayInfo.borrows[0].name:'';
    },
    setRepayValue(account, token){
      this.repayInfo.value = window.pool.getInfo(this.poolPricesFormat).accounts[account].borrows[token].value.toString();
    },
    setRepayStableAccountInfo(accountIndex){
      let accountBorrows = window.pool.getInfo(this.poolPricesFormat).accounts[accountIndex].borrows
      let accountBorrowsKeys = Object.keys(accountBorrows).filter(x => window.pool.config.stable.includes(x))
      this.repayStableInfo.borrows = []
      accountBorrowsKeys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(accountBorrows, key)) {
          this.repayStableInfo.borrows.push({
            name: key,
            value: accountBorrows[key].value?accountBorrows[key].value.toString(): '',
          })
        }
      })
      this.repayStableInfo.token = this.repayStableInfo.borrows[0].name?this.repayStableInfo.borrows[0].name:'';
    },
    setRepayStableValue(account, token){
      this.repayStableInfo.value = window.pool.getInfo(this.poolPricesFormat).accounts[account].borrows[token].value.toString();
    },
    repayStable(repayStableInfo){
      const test = window.pool.burn(repayStableInfo.account, repayStableInfo.token, parseFloat(repayStableInfo.value));
      if (test){
        this.history.push(`аккаунт №${repayStableInfo.account + 1} вернул стейбл коины на сумму ${repayStableInfo.token} ${repayStableInfo.value}`);
      } else {
        this.$buefy.toast.open({
          message: `Ошибка! Возврат стейбл коинов не прошёл!`,
          type: 'is-danger'
        })
        this.history.push(`Не удачная попытка вернуть стейбл коины аккаунта №${repayStableInfo.account + 1} на сумму ${repayStableInfo.token} ${repayStableInfo.value}`);
      }      
      this.updateResults();
    },
    setMaxLiquidate(accountId, token){
      let maxL = window.pool.getInfo(this.poolPricesFormat).accounts[accountId]?.borrows[token]?.value.toString()
      this.liquidateInfo.maxLiquidate = maxL?maxL:0;
      this.liquidateInfo.value = this.liquidateInfo.maxLiquidate.toString();
    },
    setLiqidateOptions1(accountId1, accountId2){
      this.liquidateInfo.options1 = Object.keys(window.pool.accounts.get(accountId1).borrows).filter(x => Object.keys(window.pool.accounts.get(accountId2).balance).includes(x));
      this.liquidateInfo.token = this.liquidateInfo.options1[0];
      this.setMaxLiquidate(this.liquidateInfo.account, this.liquidateInfo.token);
    },
    setLiqidateOptions(accountId1){
      this.liquidateInfo.options = Object.keys(window.pool.accounts.get(accountId1).deposits)
      this.liquidateInfo.token2 = this.liquidateInfo.options[0];
    },
    liquidate(liquidateInfo){
      window.pool.liquidate(liquidateInfo.account, liquidateInfo.token, parseFloat(liquidateInfo.value), liquidateInfo.token2, liquidateInfo.account2);
      this.updateResults();
      this.history.push(`аккаунт №${liquidateInfo.account2 + 1} ликвидировал займ ${ liquidateInfo.token2} на сумму ${liquidateInfo.token} ${liquidateInfo.value} аккаунту №${liquidateInfo.account + 1}`);
    },
    setMaxLiquidateStable(accountId, token){
      let maxL = window.pool.getInfo(this.poolPricesFormat).accounts[accountId]?.borrows[token]?.value.toString();
      this.liquidateStableInfo.maxLiquidate = maxL?maxL:0;
      this.liquidateStableInfo.value = this.liquidateStableInfo.maxLiquidate.toString();
    },
    setLiqidateStableOptions1(accountId1){
      this.liquidateStableInfo.options1 = Object.keys(window.pool.accounts.get(accountId1).balance).filter(x => window.pool.config.stable.includes(x))
      this.liquidateStableInfo.token = this.liquidateStableInfo.options1[0]
    },
    setLiqidateStableOptions(accountId1, accountId2){
      console.log(accountId2);
      // this.liquidateStableInfo.options = Object.keys(window.pool.accounts.get(accountId1).deposits).filter(x => Object.keys(window.pool.accounts.get(accountId2).balance).includes(x))
      this.liquidateStableInfo.options = Object.keys(window.pool.accounts.get(accountId1).deposits);
      this.liquidateStableInfo.token2 = this.liquidateStableInfo.options[0]
    },
    liquidateS(liquidateStableInfo){
      const test = window.pool.liquidateStable(liquidateStableInfo.account, liquidateStableInfo.token, parseFloat(liquidateStableInfo.value), liquidateStableInfo.token2, liquidateStableInfo.account2);
      if (test) {
        this.history.push(`аккаунт №${liquidateStableInfo.account2 + 1} ликвидировал стейбл коинов ${ liquidateStableInfo.token2} на сумму ${liquidateStableInfo.token} ${liquidateStableInfo.value} аккаунту №${liquidateStableInfo.account + 1}`);
      } else {
        this.$buefy.toast.open({
          message: `Ошибка! Стейбл коины не ликвидированы!`,
          type: 'is-danger'
        })
        this.history.push(`аккаунт №${liquidateStableInfo.account2 + 1} НЕ ликвидировал стейбл коинов ${ liquidateStableInfo.token2} на сумму ${liquidateStableInfo.token} ${liquidateStableInfo.value} аккаунту №${liquidateStableInfo.account + 1}`);
      }
      this.updateResults();
    },
    setMaxToMint(accountId, token){
      this.mintInfo.maxMint = window.pool.getMaxMint(accountId, token).toString();
      this.mintInfo.value = this.mintInfo.maxMint;
    },
    setMintOptions(){
      this.mintInfo.token = this.stable[0];
    },
    mint(mintInfo){
      window.pool.mint(mintInfo.account, { name: mintInfo.token, borrowAmount: parseFloat(mintInfo.value) });
      this.history.push(`аккаунт №${mintInfo.account + 1} выпустил стейбл коины на сумму ${mintInfo.token} ${mintInfo.value}`);
      this.updateResults();
    },
    setTradeValue(account, token){
      this.tradeInfo.value = this.poolAccounts[account].balance[token].toString();
    },
    setTradeOptions(account){
      const balance = this.poolAccounts[account].balance;
      let test = true;
      for (let key in balance) {
        if (test){
          this.tradeInfo.token = key;
        }
        test = false;
      }
    },
    setTradeResult(account, token, token2, value ){
      const trade1 = window.pool.tradePool(account, [`${token}/${token2}`, parseFloat(value)], 1);
      this.tradeInfo.value2 = trade1.value.toString()
    },
    trade(tradeInfo){
      const trade1 = window.pool.tradePool(tradeInfo.account, [`${tradeInfo.token}/${tradeInfo.token2}`, parseFloat(tradeInfo.value)]);
      this.updateResults();
      this.$buefy.toast.open(`вы получили ${trade1.name} ${trade1.value.toString()}`)
      this.history.push(`аккаунт №${tradeInfo.account + 1} обменял ${tradeInfo.token} / ${tradeInfo.token2} на сумму ${tradeInfo.value} (получил ${trade1.name} ${trade1.value.toString()})`);
    },
  },
  created(){
    window.oracle.init(config);
    window.pool.createPool(config);
    this.setPrices(config.prices);
    this.addStable('sUSD');
    this.form1.forEach((item, index) => {
      if (item.name == 'tokens') {
        this.$set(this.form1, index, Object.assign({}, this.form1[index], { value: this.pricesOptions }))
      }
    })
    this.form1.forEach((item, index) => {
      if (item.name == 'stable') {
        this.$set(this.form1, index, Object.assign({}, this.form1[index], { value: this.stable.filter(() => true) }))
      }
    })
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