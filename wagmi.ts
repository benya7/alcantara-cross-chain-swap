import { mainnet, polygon, arbitrum, bsc, avalanche, fantom } from "@wagmi/chains";
import { configureChains } from "@wagmi/core";
import { publicProvider } from "wagmi/providers/public";
import { customChains } from "./config/chains";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask"
import { CoinbaseWalletConnector } from "@wagmi/connectors/coinbaseWallet";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
import { InjectedConnector } from "@wagmi/connectors/injected";
import { createClient } from "wagmi";

// const parsedLocalChains: Chain[] = localChains.map((localChain) => ({
//   id: localChain.chainId,
//   name: localChain.name,
//   network: `local-${localChain.chainId}`,
//   nativeCurrency: {
//     name: localChain.tokenName,
//     symbol: localChain.tokenSymbol,
//     decimals: 18
//   },
//   rpcUrls: {
//     default: localChain.rpc
//   }
// }));

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, polygon, arbitrum, bsc, avalanche, fantom, ...customChains],
  [publicProvider()]
);

export const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});
