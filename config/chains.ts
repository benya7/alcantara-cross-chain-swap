import { Chain } from "@wagmi/core";

export interface AxelarChain {
  name: string;
  chainId: number;
  image: string;
  nativeSymbol: string;
  gateway: string;
  gasReceiver: string;
}

export const customChains: Chain[] = [
  {
    id: 1284,
    name: "Moonbeam",
    network: "moonbeam",
    nativeCurrency: { name: "GMLR", symbol: "GMLR", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://rpc.ankr.com/moonbeam"],
      },
    },
    blockExplorers: {
      default: {
        name: "Moonscan",
        url: "https://moonscan.io",
      },
    },
  },
];

export const relayerGasFeeInUusdc: { [key: string]: string} = {
  Ethereum: "10000000",
  Polygon: "1000000",
  Arbitrum: "1000000",
  Fantom: "1000000",
  Avalanche: "1000000",
  Binance: "1000000",
  Moonbeam: "1000000",
}

const mainnetChains = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    image: "https://docs.axelar.dev/images/chains/ethereum.svg",
    nativeSymbol: "ETH",
    gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    image: "https://docs.axelar.dev/images/chains/polygon.svg",
    nativeSymbol: "MATIC",
    gateway: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    image: "https://docs.axelar.dev/images/chains/arbitrum.svg",
    nativeSymbol: "ETH",
    gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
  fantom: {
    name: "Fantom",
    chainId: 250,
    image: "https://docs.axelar.dev/images/chains/fantom.svg",
    nativeSymbol: "FTM",
    gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
  avalanche: {
    name: "Avalanche",
    chainId: 43114,
    image: "https://docs.axelar.dev/images/chains/avalanche.svg",
    nativeSymbol: "AVAX",
    gateway: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
  binance: {
    name: "Binance",
    chainId: 56,
    image: "https://docs.axelar.dev/images/chains/binance.svg",
    nativeSymbol: "BNB",
    gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
  moonbeam: {
    name: "Moonbeam",
    chainId: 1284,
    image: "https://docs.axelar.dev/images/chains/moonbeam.svg",
    nativeSymbol: "GLMR",
    gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    gasReceiver: "0x2d5d7d31F671F86C782533cc367F14109a082712",
  },
};

// const parsedLocalChains: { [key: string]: AxelarChain } = {
//   [localChains[0].name.toLocaleLowerCase()]: {
//     name: localChains[0].name,
//     chainId: localChains[0].chainId,
//     image: `https://docs.axelar.dev/images/chains/${localChains[0].name.toLowerCase()}.svg`,
//     nativeSymbol: localChains[0].tokenSymbol,
//     gateway: localChains[0].gateway,
//     gasReceiver: localChains[0].gasReceiver,
//   },
//   [localChains[1].name.toLocaleLowerCase()]: {
//     name: localChains[1].name,
//     chainId: localChains[1].chainId,
//     image: `https://docs.axelar.dev/images/chains/${localChains[1].name.toLowerCase()}.svg`,
//     nativeSymbol: localChains[1].tokenSymbol,
//     gateway: localChains[1].gateway,
//     gasReceiver: localChains[1].gasReceiver,
//   },
//   [localChains[2].name.toLocaleLowerCase()]: {
//     name: localChains[2].name,
//     chainId: localChains[2].chainId,
//     image: `https://docs.axelar.dev/images/chains/${localChains[2].name.toLowerCase()}.svg`,
//     nativeSymbol: localChains[2].tokenSymbol,
//     gateway: localChains[2].gateway,
//     gasReceiver: localChains[2].gasReceiver,
//   },
//   [localChains[3].name.toLocaleLowerCase()]: {
//     name: localChains[3].name,
//     chainId: localChains[3].chainId,
//     image: `https://docs.axelar.dev/images/chains/${localChains[3].name.toLowerCase()}.svg`,
//     nativeSymbol: localChains[3].tokenSymbol,
//     gateway: localChains[3].gateway,
//     gasReceiver: localChains[3].gasReceiver,
//   },
//   [localChains[4].name.toLocaleLowerCase()]: {
//     name: localChains[4].name,
//     chainId: localChains[4].chainId,
//     image: `https://docs.axelar.dev/images/chains/${localChains[4].name.toLowerCase()}.svg`,
//     nativeSymbol: localChains[4].tokenSymbol,
//     gateway: localChains[4].gateway,
//     gasReceiver: localChains[4].gasReceiver,
//   },
// };

export const chainsDetailsData: { [key: string]: AxelarChain } = mainnetChains;
