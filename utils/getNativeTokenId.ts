export default function getNativeTokenId(chainId: string) {
  switch (chainId) {
    case '1':
      return 'ethereum';
    case '137':
      return 'matic-network';
    case '42161':
      return 'ethereum';
    case '250':
      return 'fantom';
    case '43114':
      return 'avalanche-2';
    case '56':
      return 'binancecoin';
    case '1284':
      return 'moonbeam';
    default:
      return 'ethereum';
  }
}