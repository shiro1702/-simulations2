export default {
	namespaced: true,
	state: {
		items: [
            [
                // {
                //     name: "BTC",
                //     value: 100,
                //     checked: false,
                // },
                // {
                //     name: "ETH",
                //     value: 100,
                //     checked: true,
                // },
                // {
                //     name: "USDT",
                //     value: 100,
                //     checked: true,
                // },
                // {
                //     name: "EOS",
                //     value: 100,
                //     checked: false,
                // },
                // {
                //     name: "sUSD",
                //     value: 100,
                //     checked: false,
                // },
            ],
        ],
        poolAccounts: [
            
        ]
	},
	getters: {
        itemsChecked: state => {
            return state.items.map(item => {
                // let nItem = Object.assign({}, item, {});
                return item.filter( item2 => {
                    return item2.checked;
                });
            })
        }
	},
	mutations: {
		// создание контакта
		createItem(state, data){ 
			state.items.push(data)
		},
		// редактивроание контакта
		editItem(state, data){
            let i = data.i;
            console.log(i);
			state.items.splice(i, 1, data.data)
		},
		// удаление контакта
		deleteItem(state, i){
			state.items.splice(i, 1)
        },
        setInfo(state, poolAccounts){
            state.poolAccounts = poolAccounts;
        },

	},
	actions: {
		// сохранение или редактирование контакта смотря есть ли id
		saveItem({commit}, item){
            console.log(item);
            if (item.i != undefined ){
                console.log('editItem', item.i );
                commit('editItem', item);
            } else {
                console.log('createItem');
                commit('createItem', item.data);
            }
		},
		// удаление контакта
		deleteItem({commit}, i){
            commit('deleteItem', i);
        },
        addBalanceToAccount({state, dispatch}, {i, data, pricesFormat}){
            if (i){
                window.pool.accounts.issueBalance(i, data)
            } else {
                window.pool.accounts.issueBalance(Object.keys(state.poolAccounts).length, data)
            }
            dispatch('updateAccounts', pricesFormat);
        },
        updateAccounts({commit}, pricesFormat){
            // window.pool.accounts.issueBalance(index, data)
            console.log(window.pool.getInfo(pricesFormat).accounts);
            commit('setInfo', window.pool.getInfo(pricesFormat).accounts);
        },
	}
};