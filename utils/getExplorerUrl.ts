export default function getExplorerUrl(chainId: number) {
  switch (chainId) {
    case 1:
      return "https://etherscan.io";
    case 137:
      return "https://polygonscan.com";
    case 42161:
      return "https://arbiscan.io";
    case 250:
      return "https://ftmscan.io";
    case 43131:
      return "https://snowtrace.io";
    case 56:
      return "https://bscscan.io";
    case 1284:
      return "https://moonscan.io";
    default:
      return "https://etherscan.io";
  }
}
