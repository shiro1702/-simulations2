// const D = require("decimal.js");

import D from 'decimal.js'

class Oracle {
  init = (config) => {
    this.tokens = Array.from(config.tokens);
    this.prices = Object.assign({}, config.prices);
  };

  // changes prices up to +/-10% each call
  getNewPrices = () => {
    this.tokens.forEach((t) => {
      this.prices[t] = new D(this.prices[t]).mul(this.rand_normal().plus(1));
    });

    return this.prices;
  };

  // pseudo-normal distribution with 0 mean, 0.03 dev in ≈ (-0.1, 0.1) range
  rand_normal = () => {
    var rand = new D(0);
    const samples = 6;
    for (var i = 0; i < samples; i += 1) {
      rand = rand.plus(Math.random()).minus(0.5);
    }
    return rand.div(samples).div(4);
  }
}

// module.exports = { Oracle };
export default Oracle