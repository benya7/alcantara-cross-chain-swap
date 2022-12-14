import { Chain, chain, configureChains, createClient } from "wagmi";

import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import localChains from "./config/localChains.json";
import { publicProvider } from "wagmi/providers/public";
import { chainsConfigData } from "./config/chains";

const parsedLocalChains: Chain[] = localChains.map((localChain) => ({
  id: localChain.chainId,
  name: localChain.name,
  network: `local-${localChain.chainId}`,
  nativeCurrency: {
    name: localChain.tokenName,
    symbol: localChain.tokenSymbol,
    decimals: 18
  },
  rpcUrls: {
    default: localChain.rpc
  }
}));

const { chains, provider, webSocketProvider } = configureChains(
  [
    ...(process.env.NODE_ENV !== "development"
      ? [...parsedLocalChains]
      : [chain.mainnet, chain.polygon, chain.arbitrum, ...chainsConfigData]),
  ],
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
