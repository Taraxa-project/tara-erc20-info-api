export default () => ({
  provider: process.env.PROVIDER,
  taraProvider: process.env.TARA_PROVIDER,
  tokenAddress: process.env.TOKEN_ADDRESS,
  stakingAddress: process.env.STAKING_ADDRESS,
  dposAddress: process.env.MAINNET_DPOS_CONTRACT_ADDRESS,
  deployerAddress: process.env.DEPLOYER_ADDRESS,
  delegationAPIRoot: process.env.DELEGATION_API_ROOT_URI,
  mainnetIndexerRootUrl: process.env.MAINNET_INDEXER_ROOT_URL,
  testnetIndexerRootUrl: process.env.TESTNET_INDEXER_ROOT_URL,
  coinGeckoTaraxaApi: process.env.COINGECKO_API_TARAXA_URI,
  githubAccessToken: process.env.GITHUB_ACCESS_TOKEN,
  graphQLGitHubURI: 'https://api.github.com/graphql',
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  redisName: process.env.REDIS_NAME,
});
