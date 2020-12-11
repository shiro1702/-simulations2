export default {
	namespaced: true,
	state: {
        poolPrices: []
	},
	getters: {
        poolPricesFormat: state => {
            let price = {}
            state.poolPrices.forEach(item => {
                price[item.name] = item.value;
            });
            return price
        },
	},
	mutations: {
        setPrices(state, poolPrices){
            state.poolPrices = [];
            for (const key in poolPrices) {
                if (Object.prototype.hasOwnProperty.call(poolPrices, key)) {
                    state.poolPrices.push({
                        name: key,
                        value: parseFloat(poolPrices[key]),
                    })
                }
            }
            window.pool.setPrices(poolPrices)
        },
	},
	actions: {
        setPricesArray({commit}, poolPrices){
            let price = {}
            poolPrices.forEach(item => {
                price[item.name] = item.value;
            });
            commit('setPrices', price)
        },
        // updatePrices({commit}, pricesFormat){
        //     // window.pool.accounts.issueBalance(index, data)
        //     // console.log(window.pool.getInfo(pricesFormat).accounts);
        //     console.log(commit);
        //     console.log(window.pool.getInfo(pricesFormat).prices);
        //     // commit('setPrices', window.pool.getInfo(pricesFormat).prices);
        // },
	}
};