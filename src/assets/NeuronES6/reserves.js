// const D = require("decimal.js");
import D from 'decimal.js'
class Reserves {
  constructor(config) {
    this.config = config;
    this.reserves = {};
  }
  get = (name) => {
    if (!this.reserves[name]) {
      this.reserves[name] = {
        value: new D(0),
        totalBorrows: new D(0),
        borrowIndex: this.config.dayRate,
        totalReserves: new D(0),
        price: new D(0),
        capital: new D(0),
        weight: new D(0),
        staked: new D(0),
        prevDay: new D(this.config.day),
      };
    }
    return this.reserves[name];
  };
  all = () => this.reserves;
  addValue = (name, value) => {
    this.get(name).value = this.get(name).value.plus(value);
  };
  setPrice = (name, price) => {
    this.get(name).price = new D(price);
  };
  getValue = (name) => this.get(name).value;
  getValueWithBorrows = (name) => this.get(name).value.plus(this.get(name).totalBorrows);
  getPrice = (name) => this.get(name).price;
  getCapital = (name) => {
    return this.get(name).value.times(this.get(name).price)
  };
  getLiquidCapital = () => {
    return Object.keys(this.all())
      .map((name) => this.getCapital(name))
      .reduce((acc, v) => new D(acc).plus(new D(v)), new D(0));
  };
  getBorrowedCapital = () => {
    return Object.keys(this.all())
      .map((name) => this.get(name).totalBorrows.times(this.get(name).price))
      .reduce((acc, v) => new D(acc).plus(new D(v)), new D(0));
  };
  getFullCapital = () => {
    return this.getLiquidCapital().plus(this.getBorrowedCapital());
  };
}

// module.exports = { Reserves };
export default Reserves;