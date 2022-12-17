import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { BaseToken } from "../config/tokens";

export default function processTokenAmount(
  amount: string | BigNumber = "0",
  decimals?: number
) {
  if (!decimals) {
    return {
      value: BigNumber.from("0"),
      raw: "0",
      formated: "0",
      float: 0,
    };
  } else {
    const value = typeof amount === "string" ? parseUnits(amount, decimals) : amount;
    const formated = formatUnits(value.toString(), decimals);
    return {
      value,
      raw: value.toString(),
      formated,
      float: parseFloat(formated),
    };
  }
}
