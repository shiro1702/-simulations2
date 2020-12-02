export default {
	namespaced: true,
	state: {
		items: [
            [
                {
                    name: "BTC",
                    value: 100,
                    checked: false,
                },
                {
                    name: "ETH",
                    value: 100,
                    checked: true,
                },
                {
                    name: "USDT",
                    value: 100,
                    checked: true,
                },
                {
                    name: "EOS",
                    value: 100,
                    checked: false,
                },
                {
                    name: "sUSD",
                    value: 100,
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
            console.log(i);
			state.items.splice(i, 1, data.data)
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
		}
	}
};