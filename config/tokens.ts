import ethereumTokens from "../config/1inchTokens/ethereum.json";
import binanceTokens from "../config/1inchTokens/binance.json";
import polygonTokens from "../config/1inchTokens/polygon.json";
import avalancheTokens from "../config/1inchTokens/avalanche.json";
import fantomTokens from "../config/1inchTokens/fantom.json";
import arbitrumTokens from "../config/1inchTokens/arbitrum.json";

export interface BaseToken {
  name?: string;
  symbol: string;
  address: string;
  logoURI?: string;
  decimals: number;
  tags?: string[];
}

const mainnetTokens = {
  ethereum: [
    ...Object.values(ethereumTokens.tokens),
  ],
  binance: [
    {
      symbol: "axlUSDC",
      name: "Axelar USD Coin",
      address: "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
      logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
      decimals: 6,
    },
    ...Object.values(binanceTokens.tokens),
  ],
  polygon: [
    {
      symbol: "axlUSDC",
      name: "Axelar USD Coin",
      address: "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
      logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
      decimals: 6,
    },
    ...Object.values(polygonTokens.tokens),
  ],
  avalanche: [
    {
      symbol: "axlUSDC",
      name: "Axelar USD Coin",
      logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
      address: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      decimals: 6,
    },
    ...Object.values(avalancheTokens.tokens),
  ],
  fantom: [
    {
      symbol: "axlUSDC",
      name: "Axelar USD Coin",
      logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
      address: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      decimals: 6,
    },
    ...Object.values(fantomTokens.tokens),
  ],
  moonbeam: [
    {
      symbol: "axlUSDC",
      name: "Axelar USD Coin",
      logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
      address: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
      decimals: 6,
    },
  ],
  arbitrum: [
    {
      symbol: "axlUSDC",
      name: "Axelar USD Coin",
      logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
      address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
      decimals: 6,
    },
    ...Object.values(arbitrumTokens.tokens),
  ],
};

// const localTokens = {
//   ethereum: [
//     {
//       symbol: "aUSDC",
//       name: "Axelar USD Coin",
//       address: "0xb2F4857D2e4374db9Fc6CD2D3Abd69D86F2C511d",
//       logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
//       decimals: 6,
//     },
//   ],
//   polygon: [
//     {
//       symbol: "aUSDC",
//       name: "Axelar USD Coin",
//       address: "0x9393F48055831BfC7e45FD92F58D809e8984Fb43",
//       logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
//       decimals: 6,
//     },
//   ],
//   avalanche: [
//     {
//       symbol: "aUSDC",
//       name: "Axelar USD Coin",
//       logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
//       address: "0x1d1aD0c677c2Ca7945f0B9D47298ca8eb9e61909",
//       decimals: 6,
//     },
//   ],
//   fantom: [
//     {
//       symbol: "aUSDC",
//       name: "Axelar USD Coin",
//       logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
//       address: "0x7372D8FD854fF842a71b6004B4B9Ff4D0951BAFc",
//       decimals: 6,
//     },
//   ],
//   moonbeam: [
//     {
//       symbol: "aUSDC",
//       name: "Axelar USD Coin",
//       logoURI: "https://docs.axelar.dev/images/assets/usdc.svg",
//       address: "0xdeD4Dfb12796288F855D590e4750bB0ea17DC421",
//       decimals: 6,
//     },
//   ],
// };

export const baseTokens: { [key: string]: BaseToken[] } = mainnetTokens;
