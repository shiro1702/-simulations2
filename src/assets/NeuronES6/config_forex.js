const config = {
  tokens: ["USD", "AUD", "EUR", "RUB"],
  stable: ["sUSD"],
  tradeFee: 1, // 1%
  baseMultiplier: 2,
  baseRate: 5,
  reserveFactor: 0.1,
  collateralFactor: 0.5,
  closeFactor: 0.5,
  liquidationIncentive: 0.97,
  penaltyCoefficient: 0.1,
  prices: { AUD: 0.73, EUR: 1.19, USD: 1, RUB: 0.013, sUSD: 1 },
};

export default config;