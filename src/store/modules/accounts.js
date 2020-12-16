export default {
	namespaced: true,
	state: {
        poolAccounts: []
	},
	getters: {
        accountSumm: (state, getters, rootState, rootGetters) => {
            let poolAccountsSumm = [];
            state.poolAccounts.forEach(item => {
                let summ = 0;
                // console.log('item', item);
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
        accountAllSumm: (state, getters) => {
            console.log(getters.accountSumm);
            if (getters.accountSumm.length > 0) {
                console.log(getters.accountSumm.reduce((accumulator, item) => accumulator + item, 0));
                return getters.accountSumm.reduce((accumulator, item) => accumulator + item, 0);
            }
            return 0;
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
            // console.log(state, dispatch);
            if (i != undefined){
                // console.log('old');
                window.pool.accounts.issueBalance(i, data)
            } else {
                // console.log('new');
                // console.log(Object.keys(state.poolAccounts).length);
                window.pool.accounts.issueBalance(Object.keys(state.poolAccounts).length, data)
            }
            setTimeout(()=>{dispatch('updateAccounts', pricesFormat)}, 0)
            
        },
        updateAccounts({commit}, pricesFormat){
            // console.log(commit);
            // console.log(pricesFormat);
            // // window.pool.accounts.issueBalance(index, data)
            // // console.log(window.pool.getInfo(pricesFormat).accounts);
            // console.log(window.pool);
            commit('setInfo', window.pool.getInfo(pricesFormat).accounts);
        },
	}
};