export default {
	namespaced: true,
	state: {
        poolAccounts: [
            
        ]
	},
	getters: {
        accountSumm: (state, getters, rootState, rootGetters) => {
            let poolAccountsSumm = [];
            state.poolAccounts.forEach(item => {
                let summ = 0;
                for (const key in item.balance) {
                    if (Object.prototype.hasOwnProperty.call(item.balance, key) && rootGetters['prices/poolPricesFormat'][key]) {
                        summ+= parseFloat(item.balance[key]) * rootGetters['prices/poolPricesFormat'][key]
                    } else {
                        const xKey = key.split('x')[1]
                        if (rootGetters['prices/poolPricesFormat'][xKey]){
                            summ+= parseFloat(item.balance[key]) * window.pool._getExchangeRate(xKey).toString() * rootGetters['prices/poolPricesFormat'][xKey]
                        }
                    }
                    // if (Object.prototype.hasOwnProperty.call(item.balance, key) && rootGetters['prices/poolPricesFormat'][key]) {
                    //     summ+= parseFloat(item.balance[key]) * rootGetters['prices/poolPricesFormat'][key]
                    // }
                }
                poolAccountsSumm.push(summ)
            })
            return poolAccountsSumm;
        },
	},
	mutations: {
        setInfo(state, poolAccounts){
            state.poolAccounts = [];
            for (const key in poolAccounts) {
                if (Object.prototype.hasOwnProperty.call(poolAccounts, key)) {
                    state.poolAccounts.push(poolAccounts[key])
                }
            }
        },

	},
	actions: {
        addBalanceToAccount({state, dispatch}, {i, data, pricesFormat}){
            console.log( {i, data, pricesFormat} );
            if (i != undefined){
                window.pool.accounts.issueBalance(i, data)
            } else {
                window.pool.accounts.issueBalance(Object.keys(state.poolAccounts).length, data)
            }
            dispatch('updateAccounts', pricesFormat);
        },
        updateAccounts({commit}, pricesFormat){
            // window.pool.accounts.issueBalance(index, data)
            // console.log(window.pool.getInfo(pricesFormat).accounts);
            commit('setInfo', window.pool.getInfo(pricesFormat).accounts);
        },
	}
};