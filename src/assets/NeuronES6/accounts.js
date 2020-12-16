// const D = require("decimal.js");

import D from 'decimal.js'

class Accounts {
  constructor() {
    this.accounts = {};
  }
  get = (accountId) => {
    if (!this.accounts[accountId]) {
      this.accounts[accountId] = {
        borrows: {},
        deposits: {},
        balance: {},
        dao: { importance: new D(0), dTokens: new D(0), delegators: [] } };
      return this.accounts[accountId];
    }
    return this.accounts[accountId];
  };
  all = () => this.accounts;
  values = () => Object.values(this.accounts);
  addDeposit = (accountId, name, value, share, price) => {
    if (this.get(accountId).deposits[name]) {
      let deposit = this.get(accountId).deposits[name];
      deposit.value = deposit.value.plus(value);
      deposit.share = deposit.share.plus(share);
      deposit.capital = deposit.capital.plus(
        new D(value).times(price)
      );
    } else {
      this.get(accountId).deposits[name] = {
        value: new D(value),
        share,
        capital: new D(value).times(price),
      };
    }
  };
  removeDeposit = (accountId, name, _value, share, price) => {
    if (this.get(accountId).deposits[name]) {
      let deposit = this.get(accountId).deposits[name];
      const valueFromShare = deposit.value.times(D.div(share, deposit.share));
      deposit.value = deposit.value.minus(valueFromShare);
      deposit.share = deposit.share.minus(share);
      deposit.capital = deposit.capital.minus(
        new D(valueFromShare).times(price)
      );
    }
  };
  getDeposit = (accountId, name) => this.get(accountId).deposits[name];

  setBorrow = (accountId, name, borrowAmount, borrowIndex) => {
    if(this.get(accountId).borrows[name]) {
      const borrow = this.get(accountId).borrows[name];
      borrow.value = borrowAmount;
      borrow.interestIndex = borrowIndex;
    } else {
      this.get(accountId).borrows[name] = {
        value: new D(borrowAmount),
        interestIndex: new D(borrowIndex),
      };
    }
  };
  countBorrow = (accountId, name, borrowIndex) => {
    const account = this.get(accountId);
    if (!account.borrows[name] || account.borrows[name].value.eq(0)) {
      return new D(0);
    }
    const principalTimesIndex = account.borrows[name].value.times(borrowIndex);
    return principalTimesIndex.div(account.borrows[name].interestIndex);
  };

  issueBalance = (accountId, tokens) => {
    Object.entries(tokens).forEach(([t, v]) => {
      if (this.get(accountId).balance[t]) {
        this.get(accountId).balance[t] = this.get(accountId).balance[t].plus(v);
      } else {
        this.get(accountId).balance[t] = new D(v);
      }
    });
  }
  addBalance = (accountId, token, value) => {
    if (this.get(accountId).balance[token]) {
      this.get(accountId).balance[token] = this.get(accountId).balance[token].plus(value);
    } else {
      this.get(accountId).balance[token] = new D(value);
    }
  }
  subBalance = (accountId, token, value) => {
    let balance = this.get(accountId).balance;
    if (balance[token] && balance[token].gte(value)) {
      this.get(accountId).balance[token] = balance[token].minus(value);
      return true;
    } else {
      console.log(`Not enough balance to spend ${value} ${token}`);
      return false;
    }
  }

  forEach = (callback) => {
    for (let id in this.accounts) {
			if (Object.prototype.hasOwnProperty.call(this.accounts, id)) {
				callback(this.accounts[id], id, this.accounts);
			}
		}
  }
}

export default Accounts;
