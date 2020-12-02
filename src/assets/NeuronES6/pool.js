// const D = require("decimal.js");

// const { lambertW } = require("./utils");
// const { Accounts } = require("./accounts");
// const { Reserves } = require("./reserves");

import D from 'decimal.js'
import {lambertW} from './utils.js'
import Accounts from './accounts.js'
import Reserves from './reserves.js'

const DAYS_PER_YEAR = 365;

class NeuronPool {
  createPool = (config) => {
    this.config = config;
    this.sTokens = {};
    this.history = [];
    this.day = 1;
    this.fees = {
      tradeFee: new D(config.tradeFee),
    };
    this.stabFund = {};
    this.collateralFactor = new D(this.config.collateralFactor);
    // this.penaltyCoefficient = new D(this.config.penaltyCoefficient);
    this.dayRate = new D(this.config.baseRate).div(DAYS_PER_YEAR);
    this.dayMultiplier = new D(this.config.baseMultiplier).div(DAYS_PER_YEAR);
    this.reserveFactor = new D(this.config.reserveFactor).div(DAYS_PER_YEAR);
    this.accounts = new Accounts();
    this.reserves = new Reserves({ day: this.day, dayRate: this.dayRate });
    this.dynamicParams = {
      stabPercentage: new D(30),
      closeFactor: new D(this.config.closeFactor),
      penaltyCoefficient: new D(this.config.penaltyCoefficient),
    };
    this.tickCallbacks = [];
    if (config.prices) {
      this.setPrices(config.prices);
    }
  };

  tick = (days = 1) => {
    this.day += days;
    this._updateIndexesAll();
    this._updateAccountsIndex();
    this.tickCallbacks.forEach((call) => call(days));
  };

  addTicker = (tickCallback) => {
    this.tickCallbacks.push(tickCallback);
  };

  redeem = (accountId, name, share, minReturn = 0, force = false) => {
    this._updateIndexes(name);
    const deposit = this.accounts.getDeposit(accountId, name);
    if (!deposit || deposit.share.lessThan(share))
      return {
        error: { message: "deposit not found or not enough share" },
        currentShare: deposit && deposit.share,
        specifiedShare: share,
      };
    const output = this._liquidateShareAmount(share, name);
    if (output.value.lessThan(minReturn))
      return {
        error: {
          message: "Return is less than specified minimum",
          maxReturn: output.value,
          minReturn,
        },
      };
    const sharePercentage = D.div(share, deposit.share);
    if (output.value.lessThan(deposit.value.mul(sharePercentage)) && !force) {
      const ratio = output.value.div(deposit.value);
      const loss = ratio.sqrt().mul(2).div(ratio.plus(1)).minus(1);
      console.log(loss);
      return {
        error: {
          message: "Redeem with loss",
          output: output.value,
          loss,
        },
      };
    }
    if (this.accounts.subBalance(accountId, "x" + name, share) !== true) {
      return {
        error: {
          message: "Not enough xTokens for redeem",
          token: "x" + name,
          need: share,
        },
      };
    }
    this._removeAccountDeposit(accountId, name, output.value, share);
    this.reserves.get(name).staked = this.reserves
      .get(name)
      .staked.minus(output.value);
    this._countWeights();
    this._updateAccountsIndex();
    this.accounts.addBalance(accountId, output.name, output.value);
    return output;
  };

  redeemAll = (accountId, name, minReturn = 0, force = false) => {
    const deposit = this.accounts.getDeposit(accountId, name);
    if (!deposit || deposit.share.equals(0))
      return { error: { message: "deposit not found" } };
    return this.redeem(accountId, name, deposit.share, minReturn, force);
  };

  deposit = (accountId, input) => {
    const { name, value } = input;
    if (this.accounts.subBalance(accountId, name, value) !== true) {
      console.log("Insifficient balance for deposit");
      return { name: "x" + name, value: 0 };
    }
    const share = this._addAccountDeposit(accountId, name, value);
    this.reserves.get(name).staked = this.reserves.get(name).staked.plus(value);
    this._countWeights();
    this._updateIndexes(name);
    this._updateAccountsIndex();
    this.accounts.addBalance(accountId, "x" + name, share);
    return { name: "x" + name, value: share };
  };

  getInfo = () => {
    return {
      accounts: this.accounts.all(),
      reserves: this.reserves.all(),
      sTokens: this.sTokens,
      capital: this.reserves.getFullCapital(),
      stabFund: this.stabFund,
      prices: this._getPrices(),
    };
  };

  borrow = (accountId, input) => {
    const { name, borrowAmount } = input;
    this._updateIndexes(name);
    const [_, shortfall] = this._checkBorrow(accountId, name, borrowAmount);
    const reserve = this.reserves.get(name);

    if (shortfall > 0) {
      console.log("not enough collateral");
      return;
    }

    if (reserve.value.lt(borrowAmount)) {
      console.log(`not enough reserve ${name}`);
      return;
    }

    const accountBorrows = this.accounts.countBorrow(
      accountId,
      name,
      reserve.borrowIndex
    );
    const accountBorrowsNew = accountBorrows.plus(borrowAmount);
    this.accounts.setBorrow(
      accountId,
      name,
      accountBorrowsNew,
      reserve.borrowIndex
    );
    reserve.value = reserve.value.minus(borrowAmount);
    reserve.totalBorrows = reserve.totalBorrows.plus(borrowAmount);
    this.accounts.addBalance(accountId, name, borrowAmount);
    this._countWeights();
    this._updateAccountsIndex();
  };

  mint = (accountId, input) => {
    const { name, borrowAmount } = input;

    if (this.config.stable.indexOf(name) === -1) {
      console.log("this token is not stable");
      return;
    }

    this._updateIndexes(name);
    const [_, shortfall] = this._checkBorrow(accountId, name, borrowAmount);
    const reserve = this.reserves.get(name);

    if (shortfall > 0) {
      console.log("not enough collateral");
      return;
    }

    const accountBorrows = this.accounts.countBorrow(
      accountId,
      name,
      reserve.borrowIndex
    );
    const accountBorrowsNew = accountBorrows.plus(borrowAmount);
    const totalBorrowsNew = reserve.totalBorrows.plus(borrowAmount);
    this.accounts.setBorrow(
      accountId,
      name,
      accountBorrowsNew,
      reserve.borrowIndex
    );

    reserve.totalBorrows = totalBorrowsNew;
    this.accounts.addBalance(accountId, name, borrowAmount);
    this._countWeights();
    this._updateAccountsIndex();
  };

  burn = (accountId, name, repayAmount) => {
    if (this.config.stable.indexOf(name) === -1) {
      console.log("this token is not stable");
      return;
    }

    this._updateIndexes(name);
    const reserve = this.reserves.get(name);
    const accountBorrows = this.accounts.countBorrow(
      accountId,
      name,
      reserve.borrowIndex
    );

    // TODO: fee on transaction
    const actualRepayAmount = repayAmount;
    const accountBorrowsNew = accountBorrows.minus(actualRepayAmount);
    const totalBorrowsNew = reserve.totalBorrows.minus(actualRepayAmount);

    this.accounts.setBorrow(
      accountId,
      name,
      accountBorrowsNew,
      reserve.borrowIndex
    );
    this.accounts.subBalance(accountId, name, actualRepayAmount);
    reserve.totalBorrows = totalBorrowsNew;
    this._countWeights();
    this._updateAccountsIndex();
  };

  liquidateStable = (borrower, name, repayAmount, collateralName, payer) => {
    if (this.config.stable.indexOf(name) === -1) {
      console.log("this token is not stable");
      return;
    }

    this._updateIndexesAll();
    const liqAllowed = this._liquidateBorrowAllowed(borrower, name);

    if (liqAllowed.lessThan(0) || liqAllowed.equals(0)) {
      console.log("liquidation not allowed");
      return;
    }

    const seizeTokens = this._liquidateCalculateSeizeTokens(
      name,
      collateralName,
      repayAmount
    );
    const penaltySeizeTokens = this.dynamicParams.penaltyCoefficient.times(
      seizeTokens
    );

    if (
      this.accounts
        .getDeposit(borrower, collateralName)
        .share.lt(seizeTokens.plus(penaltySeizeTokens))
    ) {
      console.log("borrower not enough collateral");
      return;
    }

    if (
      !this.accounts.get(payer).balance[name] ||
      this.accounts.get(payer).balance[name].lt(repayAmount)
    ) {
      console.log("payer not enough balance");
      return;
    }

    this.burn(borrower, name, repayAmount);
    // FIXME: small hack
    this.accounts.addBalance(borrower, name, repayAmount);

    const collateralValue = this.redeem(
      borrower,
      collateralName,
      seizeTokens,
      0,
      true
    );

    if (collateralValue.error) {
      console.log(collateralValue.error);
      return;
    }

    // FIXME: small hack
    this.accounts.subBalance(
      borrower,
      collateralValue.name,
      collateralValue.value
    );

    this.accounts.subBalance(payer, name, repayAmount);
    this.accounts.addBalance(
      payer,
      collateralValue.name,
      collateralValue.value
    );

    const penaltyValue = this.redeem(
      borrower,
      collateralName,
      penaltySeizeTokens,
      0,
      true
    );

    if (penaltyValue.error) {
      console.log(penaltyValue.error);
      return;
    }

    // FIXME: small hack
    this.accounts.subBalance(borrower, penaltyValue.name, penaltyValue.value);
    this.reserves.get(penaltyValue.name).totalReserves = this.reserves
      .get(penaltyValue.name)
      .totalReserves.plus(penaltyValue.value);
    this._updateAccountsIndex();
  };

  getMaxMint = (accountId, name) => {
    if (this.config.stable.indexOf(name) === -1) {
      console.log("this token is not stable");
      return;
    }

    const [sumLiquidity] = this._checkBorrow(accountId, name, 0);
    const oraclePrice = this.reserves.get(name).price;
    return new D(sumLiquidity).div(oraclePrice);
  };

  tradePool = (accountId, input, dry = 0) => {
    const [direction, value] = input;
    const inputFee = new D(value).div(100).times(this.fees.tradeFee);
    const inputSum = new D(value).minus(inputFee);
    const inToken = direction.split("/")[0];
    const outToken = direction.split("/")[1];
    const outAmount = this._getOutAmount(
      inputSum,
      inToken,
      outToken,
      direction
    );
    if (value <= 0) {
      console.log("Attempt to trade zero or negative value");
      return { value: 0, name: outToken };
    }
    const output = { value: outAmount, name: outToken };
    if (!dry) {
      if (this.reserves.get(outToken).value.lt(outAmount)) {
        console.log("Insufficient liquidity in the pool");
        return { value: 0, name: outToken };
      }
      if (this.accounts.subBalance(accountId, inToken, value) !== true) {
        console.log("Insifficient balance for trade");
        return { value: 0, name: outToken };
      }

      this.reserves.get(outToken).value = this.reserves
        .get(outToken)
        .value.minus(outAmount);
      const stabShare = this._stabShare(inputFee);
      this.reserves.get(inToken).value = this.reserves
        .get(inToken)
        .value.plus(new D(value).sub(stabShare));
      this._addToStabFund(inToken, stabShare);
      this.accounts.addBalance(accountId, output.name, output.value);
      this._countWeights();
      this._balanceWeights(inToken, outToken);

      this.history.push([input, output]);
    }
    return output;
  };

  sendWithConvert = (senderId, receiverId, input, dry = 0) => {
    const [direction, value] = input;
    const inputFee = new D(value).div(100).times(this.fees.tradeFee);
    const inputSum = new D(value).minus(inputFee);
    const inToken = direction.split("/")[0];
    const outToken = direction.split("/")[1];
    const outAmount = this._getOutAmount(
      inputSum,
      inToken,
      outToken,
      direction
    );
    if (value <= 0) {
      console.log("Attempt to trade zero or negative value");
      return { value: 0, name: outToken };
    }
    const output = { value: outAmount, name: outToken };
    if (!dry) {
      if (this.reserves.get(outToken).value.lt(outAmount)) {
        console.log("Insufficient liquidity in the pool");
        return { value: 0, name: outToken };
      }
      if (this.accounts.subBalance(senderId, inToken, value) !== true) {
        console.log("Insifficient balance for trade");
        return { value: 0, name: outToken };
      }

      this.reserves.get(outToken).value = this.reserves
        .get(outToken)
        .value.minus(outAmount);
      const stabShare = this._stabShare(inputFee);
      const feeWithoutStab = new D(inputFee).sub(stabShare);
      this.reserves.get(inToken).staked = this.reserves
        .get(inToken)
        .staked.minus(inputFee);
      this.reserves.get(outToken).staked = this.reserves
        .get(outToken)
        .staked.plus(inputFee);
      this.reserves.get(inToken).value = this.reserves
        .get(inToken)
        .value.plus(new D(value).sub(stabShare));
      this._addToStabFund(inToken, stabShare);
      this.accounts.addBalance(receiverId, output.name, output.value);

      this._countWeights();
      this._balanceWeights(inToken, outToken);

      this.history.push([input, output]);
    }
    return output;
  };

  repay = (borrower, name, repayAmount) => {
    this._updateIndexes(name);
    // TODO: repayBorrowAllowed
    const reserve = this.reserves.get(name);
    const borrowBalance = this.accounts.countBorrow(
      borrower,
      name,
      reserve.borrowIndex
    );

    // TODO: fee
    // https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol#L891
    const actualRepayAmount = repayAmount; // payer make transfer repayAmount
    const accountBorrowsNew = borrowBalance.minus(actualRepayAmount);
    const totalBorrowsNew = reserve.totalBorrows.minus(actualRepayAmount);

    this.accounts.setBorrow(
      borrower,
      name,
      accountBorrowsNew,
      reserve.borrowIndex
    );
    this.accounts.subBalance(borrower, name, actualRepayAmount);
    reserve.value = reserve.value.plus(actualRepayAmount);
    reserve.totalBorrows = totalBorrowsNew;
  };

  liquidate = (borrower, name, repayAmount, collateralName, payer) => {
    this._updateIndexesAll();
    const liqAllowed = this._liquidateBorrowAllowed(borrower, name);

    if (liqAllowed.lessThan(0) || liqAllowed.equals(0)) {
      console.log("liquidation not allowed");
      return;
    }

    const seizeTokens = this._liquidateCalculateSeizeTokens(
      name,
      collateralName,
      repayAmount
    );

    if (
      this.accounts.getDeposit(borrower, collateralName).share.lt(seizeTokens)
    ) {
      console.log("borrower not enough collateral");
      return;
    }

    if (
      !this.accounts.get(payer).balance[name] ||
      this.accounts.get(payer).balance[name].lt(repayAmount)
    ) {
      console.log("payer not enough balance");
      return;
    }

    this.repay(borrower, name, repayAmount);
    // FIXME: small hack
    this.accounts.addBalance(borrower, name, repayAmount);

    const collateralValue = this.redeem(
      borrower,
      collateralName,
      seizeTokens,
      0,
      true
    );

    if (collateralValue.error) {
      console.log(collateralValue.error);
      return;
    }

    // FIXME: small hack
    this.accounts.subBalance(
      borrower,
      collateralValue.name,
      collateralValue.value
    );

    this.accounts.subBalance(payer, name, repayAmount);
    this.accounts.addBalance(
      payer,
      collateralValue.name,
      collateralValue.value
    );
    this._updateAccountsIndex();
  };

  getMaxBorrow = (accountId, name) => {
    const [sumLiquidity] = this._checkBorrow(accountId, name, 0, 0);
    const oraclePrice = this.reserves.get(name).price;
    return new D(sumLiquidity).div(oraclePrice);
  };

  _liquidateCalculateSeizeTokens = (name, collateralName, repayAmount) => {
    const priceBorrowed = this.reserves.get(name).price;
    const priceCollateral = this.reserves.get(collateralName).price;

    /* 2.84 * 1.1 * 10
     * Get the exchange rate and calculate the number of collateral tokens to seize:
     *  seizeAmount = actualRepayAmount * liquidationIncentive * priceBorrowed / priceCollateral
     *  seizeTokens = seizeAmount / exchangeRate
     *   = actualRepayAmount * (liquidationIncentive * priceBorrowed) / (priceCollateral * exchangeRate)
     */
    // https://github.com/compound-finance/compound-protocol/blob/29eaad96127808dc87caf97ea13be495c37b77b1/contracts/ComptrollerG4.sol#L795
    const exchangeRate = this._getExchangeRate(collateralName); // Note: reverts on error
    const numerator = new D(this.config.liquidationIncentive).times(
      priceBorrowed
    );

    const denominator = new D(priceCollateral).times(exchangeRate);
    const ratio = numerator.div(denominator);
    return ratio.times(repayAmount).abs();
  };

  _getOutAmount = (inputSum, inToken, outToken) => {
    let out;
    const s = this.reserves.getValueWithBorrows(inToken).times(100);
    const w1 = this.reserves.get(inToken).weight;
    const w2 = this.reserves.get(outToken).weight;
    const r = this.reserves.getValueWithBorrows(outToken).times(100);
    const c = s.div(s.plus(inputSum)).pow(w1.div(w2));
    const t = new D(1).minus(c);
    out = r.times(t);
    return out;
  };

  _getInAmount = (outputSum, inToken, outToken) => {
    let out;
    const s = this.reserves.getValueWithBorrows(inToken);
    const w1 = this.reserves.get(inToken).weight;
    const w2 = this.reserves.get(outToken).weight;
    const r = this.reserves.getValueWithBorrows(outToken);
    const c = r.div(r.minus(outputSum)).pow(w2.div(w1));
    out = c.minus(1).times(s);
    return out;
  };

  _getSpotPrice = (inToken, outToken) => {
    const input = this.reserves
      .getValueWithBorrows(inToken)
      .div(this.reserves.get(inToken).weight);
    const output = this.reserves
      .getValueWithBorrows(outToken)
      .div(this.reserves.get(outToken).weight);
    const feeMultiplier = new D(1).div(
      new D(1).minus(this.fees.tradeFee.div(100))
    );
    return input.div(output).mul(feeMultiplier);
  };

  _stabShare = (feeAmount) => {
    return feeAmount.mul(this.dynamicParams.stabPercentage).div(100);
  };

  setPrices = (prices) => {
    const tokens = this._getTokens();
    tokens.forEach((t) => {
      if (prices[t]) {
        this.reserves.setPrice(t, prices[t]);
      } else {
        throw { error: `Has no price for ${t} token!` };
      }
    });
    this._countWeights();
  };

  _getTokens = () => {
    return this.config.tokens.concat(this.config.stable);
  };

  _addToStabFund = (name, value) => {
    if (this.stabFund[name] && this.stabFund[name].value) {
      this.stabFund[name].value = this.stabFund[name].value.plus(value);
    } else {
      this.stabFund[name] = {
        value: new D(value),
      };
    }
  };

  _addAccountDeposit = (accountId, name, value) => {
    const startValue = this.reserves.getValueWithBorrows(name);
    let price = this.reserves.get(name).price;
    const share = this._countShareToken(name, value, startValue);
    this.accounts.addDeposit(accountId, name, value, share, price);
    this.reserves.addValue(name, value);
    return share;
  };

  _removeAccountDeposit = (accountId, name, value, share) => {
    let price = this.reserves.get(name).price;
    this.accounts.removeDeposit(accountId, name, value, share, price);
    this.reserves.get(name).value = this.reserves.get(name).value.minus(value);
    this.sTokens[name] = this.sTokens[name].minus(share);
  };

  _liquidateShareAmount = (share, token) => {
    const liq = new D(share)
      .times(this.reserves.getValueWithBorrows(token))
      .div(this.sTokens[token]);

    return {
      value: liq,
      name: token,
    };
  };

  _countShareToken = (name, value, start) => {
    // Compound uses alternative math model. It's uses exchangeRate for
    // calculate amount xToken.
    // if totalSupply == 0 (!this.sTokens[name]) then use initialExchangeRate for underlying token
    // else use current exchangeRate
    // xToken = value / exchangeRateCurrent
    // https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol#L532
    // We can set 0.02 as initialExchangeRate for all Token then 1 Token equals 50 xToken

    let shareToken = 0;

    if (!this.sTokens[name]) {
      shareToken = new D(value).sqrt();
      this.sTokens[name] = shareToken;
    } else {
      shareToken = new D(value).div(start).times(this.sTokens[name]);
      this.sTokens[name] = this.sTokens[name].plus(shareToken);
    }

    return shareToken;
  };

  _countWeights = () => {
    const tokens = this._getTokens();

    if (!tokens.length) {
      return;
    }

    this._countCapital();
    let fullCapital = this.reserves.getFullCapital();

    tokens.forEach((t) => {
      this.reserves.get(t).weight = this.reserves
        .get(t)
        .capital.times(100)
        .div(fullCapital);
    });
  };

  // see bancor balancedWeights(...)
  _balanceWeights = (tokenId1, tokenId2) => {
    const token1 = this.reserves.get(tokenId1);
    const token2 = this.reserves.get(tokenId2);
    const sumWeights = token1.weight.plus(token2.weight);

    const logBs = token1.value.div(token1.staked).ln();
    if (logBs.abs().lt(0.001) === true) {
      return;
    }

    //const exRate = this._getSpotPrice(tokenId2, tokenId1);
    const exRate = token1.price.div(token2.price);
    const y = token1.staked.div(token2.value).mul(exRate).mul(logBs);

    const lambert = lambertW(y);
    const x = new D(lambert).div(logBs);
    // console.log({logBs, y, lambert, x});
    const w1 = D.div(x, x.plus(1)).mul(sumWeights);
    const w2 = D.div(1, x.plus(1)).mul(sumWeights);

    token1.weight = w1;
    token2.weight = w2;
  };

  _countCapital = () => {
    const tokens = this._getTokens();
    tokens.forEach((t) => {
      this.reserves.get(t).capital = this.reserves
        .getValueWithBorrows(t)
        .times(this.reserves.get(t).price);
    });
  };

  getLiqudationMax = (id, name) => {
    return this._liquidateBorrowAllowed(id, name);
  };

  _liquidateBorrowAllowed = (accountId, name) => {
    // https://github.com/compound-finance/compound-protocol/blob/29eaad96127808dc87caf97ea13be495c37b77b1/contracts/ComptrollerG4.sol#L490
    const [_, shortfall] = this._checkBorrow(accountId, name, 0);

    if (shortfall === 0) {
      return new D(0);
    }
    const borrowBalance = this.accounts.countBorrow(
      accountId,
      name,
      this.reserves.get(name).borrowIndex
    );
    return new D(this.dynamicParams.closeFactor).times(borrowBalance);
  };

  _getExchangeRate = (name) => {
    // alternative from compound
    // https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol#L350
    const reserve = this.reserves.get(name);
    return this.sTokens[name]
      ? reserve.value.plus(reserve.totalBorrows).div(this.sTokens[name])
      : new D(0);
  };

  _checkBorrow = (accountId, name, borrowAmount) => {
    const account = this.accounts.get(accountId);
    const collateralFactor = this.collateralFactor;

    this._updateIndexes(name);

    const [totalCollateral, totalBorrowPlusEffects] = this._getTokens()
      .map((tokenName) => {
        const xToken = account.deposits[tokenName]
          ? account.deposits[tokenName].share
          : new D(0);
        const borrowBalance = this.accounts.countBorrow(
          accountId,
          tokenName,
          this.reserves.get(tokenName).borrowIndex
        );
        const oraclePrice = this.reserves.get(tokenName).price;
        const exchangeRate = this._getExchangeRate(tokenName);
        const tokensToDenominator = new D(collateralFactor)
          .times(exchangeRate)
          .times(oraclePrice);

        const totalCollateral = xToken.times(tokensToDenominator).abs();
        const totalBorrowPlusEffects =
          tokenName === name
            ? borrowBalance.plus(borrowAmount).times(oraclePrice).abs()
            : borrowBalance.times(oraclePrice).abs();
        return [totalCollateral, totalBorrowPlusEffects];
      })
      .reduce(
        (prev, cur) => {
          return [prev[0].plus(cur[0]), prev[1].plus(cur[1])];
        },
        [new D(0), new D(0)]
      );

    // FIXME: modify data in function with prefix 'check' is not cool
    account.sumCollateral = totalCollateral;
    account.sumBorrowPlusEffects = totalBorrowPlusEffects;
    if (totalCollateral.gt(totalBorrowPlusEffects)) {
      return [totalCollateral.minus(totalBorrowPlusEffects), 0];
    } else {
      return [0, totalBorrowPlusEffects.minus(totalCollateral)];
    }
  };

  _updateIndexesAll = () => {
    this._getTokens().forEach((name) => this._updateIndexes(name));
  };

  _updateAccountsIndex = () => {
    Object.keys(this.accounts.all()).forEach((accountId) => {
      this._getTokens().forEach((name) => {
        this._checkBorrow(accountId, name, 0);
      });
    });
  };

  _updateIndexes = (name) => {
    const reserve = this.reserves.get(name);
    const currentDay = new D(this.day);
    const prevDay = reserve.prevDay;

    // Short-circuit accumulating 0 interest
    if (currentDay === prevDay) {
      return 0;
    }

    const cashPrior = reserve.value;
    const borrowPrior = reserve.totalBorrows;
    const reservePrior = reserve.totalReserves;
    reserve.utilizationRate = this._utilizationRate(
      cashPrior,
      borrowPrior,
      reservePrior
    );

    const borrowIndexPrior = reserve.borrowIndex;
    const borrowRate = this._getBorrowRate(
      cashPrior,
      borrowPrior,
      reservePrior
    );

    reserve.borrowRate = borrowRate.times(DAYS_PER_YEAR);
    reserve.supplyRate = this._getSupplyRate(
      cashPrior,
      borrowPrior,
      reservePrior
    ).times(DAYS_PER_YEAR);
    const dayDelta = currentDay.minus(prevDay);

    // https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol#L409
    const simpleInterestFactor = borrowRate.times(dayDelta);
    const interestAccumulated = simpleInterestFactor.times(borrowPrior);
    const totalBorrowsNew = interestAccumulated.plus(borrowPrior);
    const totalReservesNew = this.reserveFactor
      .times(interestAccumulated)
      .plus(reservePrior);
    const borrowIndexNew = simpleInterestFactor
      .times(borrowIndexPrior)
      .plus(borrowIndexPrior);

    reserve.prevDay = currentDay;
    reserve.borrowIndex = borrowIndexNew;
    reserve.totalBorrows = totalBorrowsNew;
    reserve.totalReserves = totalReservesNew;
  };

  _utilizationRate = (cash, borrows, reserves) => {
    // Utilization rate is 0 when there are no borrows
    if (!borrows || borrows.eq(0)) {
      return new D(0);
    }

    // borrows / (cash + borrows - reserves)
    // https://github.com/compound-finance/compound-protocol/blob/master/contracts/BaseJumpRateModelV2.sol#L79
    return borrows.div(cash.plus(borrows).minus(reserves));
  };

  _getBorrowRate = (cash, borrows, reserves) => {
    // https://github.com/compound-finance/compound-protocol/blob/master/contracts/BaseJumpRateModelV2.sol#L95
    const ur = this._utilizationRate(cash, borrows, reserves);
    return ur.times(this.dayMultiplier).plus(this.dayRate);
  };

  _getSupplyRate = (cash, borrows, reserves) => {
    const oneMinusReserveFactor = new D(1).minus(this.config.reserveFactor);
    const borrowRate = this._getBorrowRate(cash, borrows, reserves);
    const rateToPool = borrowRate.times(oneMinusReserveFactor);
    return this._utilizationRate(cash, borrows, reserves).times(rateToPool);
  };

  _setParameters = (params) => {
    Object.assign(this.dynamicParams, params);
  };

  _getPrices = () => {
    const filteredTokens = this._getTokens().filter(
      (t) => t.indexOf("s") === -1
    );
    const originalPrices = filteredTokens.reduce(
      (o, k, i) => ({ ...o, [k]: this.reserves.get(k).price }),
      {}
    );
    const currentPrices = {};
    for (const token1 of filteredTokens) {
      if (!currentPrices[token1]) {
        currentPrices[token1] = {};
      }
      for (const token2 of filteredTokens) {
        if (token1 === token2) {
          continue;
        }
        currentPrices[token1][token2] = this.tradePool(
          1,
          [token2 + "/" + token1, 1],
          1
        )
          .value.div(1)
          .toFixed(4);
      }
    }
    return currentPrices;
  };
}

// module.exports = { NeuronPool };
export default NeuronPool;