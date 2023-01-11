export default () => ({
  provider: process.env.PROVIDER,
  tokenAddress: process.env.TOKEN_ADDRESS,
  stakingAddress: process.env.STAKING_ADDRESS,
  delegationAPIRoot: process.env.DELEGATION_API_ROOT_URI,
  coinGeckoTaraxaApi: process.env.COINGECKO_API_TARAXA_URI,
});
