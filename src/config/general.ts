export default () => ({
  provider: process.env.PROVIDER,
  taraProvider: process.env.TARA_PROVIDER,
  tokenAddress: process.env.TOKEN_ADDRESS,
  stakingAddress: process.env.STAKING_ADDRESS,
  dposAddress: process.env.MAINNET_DPOS_CONTRACT_ADDRESS,
  deployerAddress: process.env.DEPLOYER_ADDRESS,
  delegationAPIRoot: process.env.DELEGATION_API_ROOT_URI,
  explorerRoot: process.env.EXPLORER_API_ROOT_URI,
  testnetExplorerRoot: process.env.TESTNET_EXPLORER_API_ROOT_URI,
  coinGeckoTaraxaApi: process.env.COINGECKO_API_TARAXA_URI,
  githubAccessToken: process.env.GITHUB_ACCESS_TOKEN,
  graphQLGitHubURI: 'https://api.github.com/graphql',
});
