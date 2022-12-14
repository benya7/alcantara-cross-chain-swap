import { chainsDetailsData } from "../config/chains";

export default function getNetworkImageUrl(chainId: number) {
  const chain = chainsDetailsData.find((x) => chainId == x.chainId);
  if (chain) {
    return chain.image
  } else {
    return chainsDetailsData[0].image;
  }
}