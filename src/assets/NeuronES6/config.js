const config = {
  tokens: ["BTC", "ETH", "USDT", "EOS"],
  stable: ["sUSD"],
  tradeFee: 1, // 1%
  baseMultiplier: 2,
  baseRate: 5,
  reserveFactor: 0.1,
  collateralFactor: 0.5,
  closeFactor: 0.5,
  liquidationIncentive: 0.97,
  penaltyCoefficient: 0.1,
  prices: { BTC: 10500, ETH: 350, USDT: 1, EOS: 2, sUSD: 1 },
};

export default config;
