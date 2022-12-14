import { BaseToken } from "../config/tokens";

export default function paginateTokensList(
  tokenList: BaseToken[],
  pageNumber: number,
  pageSize: number = 50
) {
  if (pageNumber === 1) {
    return tokenList.slice(0, pageSize);
  } else {
    return tokenList.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }
}
