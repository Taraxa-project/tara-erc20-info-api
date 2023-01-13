export default () => ({
  provider: process.env.PROVIDER,
  tokenAddress: process.env.TOKEN_ADDRESS,
  stakingAddress: process.env.STAKING_ADDRESS,
  delegationAPIRoot: process.env.DELEGATION_API_ROOT_URI,
});
