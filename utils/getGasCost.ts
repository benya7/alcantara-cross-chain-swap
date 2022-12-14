import { formatEther } from 'ethers/lib/utils.js';
import { BigNumber } from "ethers";

export default function getGasCost(gasLimit: string, gasPrice: BigNumber, nativePrice: string) {
  return parseFloat(formatEther(gasPrice.mul(gasLimit))) * parseFloat(nativePrice)
}