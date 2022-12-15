export default function getNativeSymbol(chain: string) {
  switch (chain) {
    case "ethereum":
      return "ETH";
    case "binance":
      return "BNB";
    case "polygon":
      return "MATIC";
    case "avalanche":
      return "AVAX";
    case "fantom":
      return "FTM";
    case "moonbeam":
      return "axlUSDC";
    case "arbitrum":
      return "wAXL";
    default:
      return "wAXL";
  }
}