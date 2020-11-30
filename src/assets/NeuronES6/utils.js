// const D = require("decimal.js");

import D from 'decimal.js'

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

const countCapital = (lp, prices) => {
  return lp
    .map((v) => new D(prices[v.name]).times(new D(v.value)))
    .reduce((acc, v) => new D(acc).plus(new D(v)));
};

// Halley's approximation of a Lambert W function
function lambertW(input, iters = 8) {
  const xinp = input;
  let x = xinp;
  if (x.gt(D.exp(1)))
    x = x.ln();
  for (let i = 0; i < iters; ++i) {
    const xexp = x.exp();
    const num = x.mul(xexp).minus(xinp);
    const dena = xexp.mul(x.add(1));
    const denb = x.add(2).mul(x.mul(xexp).sub(xinp)).div(x.mul(2).add(2));
    const den = dena.sub(denb);
    x = x.sub(num.div(den));
  }
  return x;
}


// module.exports = { onlyUnique, countCapital, lambertW };

export default { onlyUnique, countCapital, lambertW };

