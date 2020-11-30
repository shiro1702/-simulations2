// функция для генерирования геттеров и сеттеров у свойств объетов store для работы с v-model
// эту функцию нужно добавлять как метод для опредеоения this
export const genSetGet = function( tree, that = this, thatGlobal = this) { 
  let final = {};
  if (tree.children) {
    tree.children.forEach((item) => {
      let obj = genSetGet({...item, index: tree.index}, that[tree.name], thatGlobal);
      let value = Object.getOwnPropertyDescriptor(obj, item.name);
      if (value) {
        Object.defineProperty(final, item.name, value);
      }
    })
  } else {
    if (tree.inArray) {
      final[tree.name] = [];
      if (that[tree.name]) {
        that[tree.name].forEach((item, index) => {
          let obj = {}
          obj = genSetGet({name:index, children: tree.inArray, index: index }, that[tree.name], thatGlobal);
          final[tree.name].push(obj)
        })
      }
    } else {
      if (tree.name && (typeof(that[tree.name]) == 'string' || typeof(that[tree.name]) == 'number' ) ) {
        Object.defineProperty(final, tree.name, {
          get() {
            return that[tree.name] || '';
          },
          set(val) {
            let obj = {}
            obj[tree.name] = val;
            if (tree.index != undefined){
              obj.index = tree.index;
            }
            thatGlobal[tree.method](obj);
          }
        });
      }
    }

  }
  return final;
};