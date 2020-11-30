export default {
	namespaced: true,
	state: {
		items: [
            [
                {
                    name: "BTC",
                    value: 10500,
                    checked: false,
                },
                {
                    name: "ETH",
                    value: 350,
                    checked: true,
                },
                {
                    name: "USDT",
                    value: 1,
                    checked: true,
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
                },
            ],
        ],
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
			state.items.splice(i, 1, data)
		},
		// удаление контакта
		deleteItem(state, i){
			state.items.splice(i, 1)
		}
	},
	actions: {
		// сохранение или редактирование контакта смотря есть ли id
		saveItem({commit}, item){
            console.log(item);
            if (item.i != undefined ){
                console.log('editItem');
                commit('editItem', item.data);
            } else {
                console.log('createItem');
                commit('createItem', item.data);
            }
		},
		// удаление контакта
		deleteItem({commit}, i){
            commit('deleteItem', i);
		}
	}
};