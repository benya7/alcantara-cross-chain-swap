export default function getWrapedNativeSymbol(chain: string) {
  switch (chain) {
    case 'ethereum':
      return 'WETH';
    case 'binance':
      return 'WBNB';
    case 'polygon':
      return 'WMATIC';
    case 'avalanche':
      return 'WAVAX';
    case 'fantom':
      return 'WFTM';
    case 'moonbeam':
      return 'axlUSDC';
    case 'arbitrum':
      return 'wAXL'
    default:
      return 'wAXL';
  }
}