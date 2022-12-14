
import axios, { AxiosError, AxiosInstance, CancelTokenSource } from "axios";
import { BaseToken } from "../config/tokens";

interface ApiClientOptions {
  baseUrl: string;
  chainId?: number;
  /**
   * An optional factory, that should supply bearer token which will
   * be attached to authorization header when making requests.
   */
  authTokenFactory?: () => Promise<string | undefined>;
  /**
   * Write more logs into console.
   */
  debug?: boolean;
}

interface ApiRequest<TRequest = any, TParams = any> {
  readonly url: string;
  readonly method?: "GET";
  readonly requestData?: TRequest;
  readonly params?: any;
}

export interface ApiService {
  getAllowance: (chainId: number, params: AllowanceParams) => Promise<{ allowance: number }>;
  getApproveCallData: (chainId: number, params: ApproveCallDataParams ) => Promise<ApproveCallDataResponse>;
  getQuote: (chainId: number, params: QuoteParams) => Promise<QuoteResponse>;
  getSwapCallData: (chainId: number, params: SwapCallDataParams) => Promise<SwapCallDataResponse>;
  getTokensPrice: (chainId: number ) => Promise<{[key: string]: string}>,
  getNativeTokenPrice: (params: NativeTokenPriceParams) => Promise<NativeTokenPriceResponse>,
}

type AllowanceParams = {
  tokenAddress: string;
  address: string;
};

type ApproveCallDataParams = {
  tokenAddress: string;
  amount: string;
};

export type ApproveCallDataResponse = {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
};

type QuoteParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fee?: number;
  protocols?: string;
  gasPrice?: string;
  complexityLevel?: string;
  connectorTokens?: string;
  gasLimit?: string;
  mainRouteParts?: string;
  parts?: string;
  preset?: string;
};

type QuoteResponse = {
  fromToken: BaseToken;
  toToken: BaseToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: string;
  estimatedGas: string;
};

type SwapCallDataParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage: string;
  protocols?: string;
  destReceiver?: string;
  referrerAddress?: string;
  fee?: number;
  gasPrice?: string;
  permit?: string;
  burnChi?: boolean;
  complexityLevel?: string;
  connectorTokens?: string;
  allowPartialFill?: boolean;
  disableEstimate?: boolean;
  gasLimit?: string;
  mainRouteParts?: string;
  parts?: string;
};

export type SwapCallDataResponse = {
  fromToken: BaseToken;
  toToken: BaseToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: string;
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
};

type NativeTokenPriceParams = {
    ids: string;
    vs_currencies: string;
  }
type NativeTokenPriceResponse = { [key: string]: { [key: string]: string } }

export class ApiClient implements ApiService {
  private readonly client: AxiosInstance;
  private source: CancelTokenSource;

  constructor(options: ApiClientOptions) {
    if (!options?.baseUrl) {
      throw new Error("baseUrl is required");
    }
    this.source = axios.CancelToken.source();
    this.client = axios.create({
      baseURL: options.baseUrl,
    });

    this.client.interceptors.response.use(undefined, (error: AxiosError) => {
      console.log(
        `Failed to call API`,
        error.response?.status,
        error.response?.data
      );
      return Promise.reject(error);
    });
    if (options.debug) {
      this.useDebugLogs();
    }

    if (options.authTokenFactory) {
      this.useAuth(options.authTokenFactory, options.debug);
    }
  }

  public getAllowance = async (chainId: number, params: AllowanceParams) =>
    await this.callApi<{ allowance: number }>({
      url: `${chainId}/approve/allowance`,
      method: "GET",
      params,
    });

  public getApproveCallData = async (
    chainId: number,
    params: ApproveCallDataParams
  ) =>
    await this.callApi<ApproveCallDataResponse>({
      url: `${chainId}/approve/transaction`,
      method: "GET",
      params,
    });

  public getQuote = async (chainId: number, params: QuoteParams) =>
    await this.callApi<QuoteResponse>({
      url: `${chainId}/quote`,
      method: "GET",
      params,
    });

  public getSwapCallData = async (
    chainId: number,
    params: SwapCallDataParams
  ) =>
    await this.callApi<SwapCallDataResponse>({
      url: `${chainId}/swap`,
      method: "GET",
      params,
    });

  public getTokensPrice = async (chainId: number) =>
    await this.callApi<{ [key: string]: string }>(
      {
        url: `${chainId}`,
        method: "GET",
      },
      "https://token-prices.1inch.io/v1.1"
    );

  public getNativeTokenPrice = async (params: NativeTokenPriceParams) =>
    await this.callApi<NativeTokenPriceResponse>(
      {
        url: "/simple/price",
        method: "GET",
        params,
      },
      "https://api.coingecko.com/api/v3"
    );

  /**
   * Helper with saint defaults to perform an HTTP call.
   * @param request A request to perform.
   */
  private callApi<TResponse = any, TRequest = any>(
    request: ApiRequest<TRequest>,
    baseUrl?: string
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      this.client
        .request<TResponse>({
          baseURL: baseUrl,
          cancelToken: this.source.token,
          url: request.url,
          method: request.method,
          params: request.params,
          data: request.requestData,
        })
        .then((response) =>
          response?.status && response.status >= 200 && response.status < 400
            ? resolve(response?.data)
            : reject(response?.data)
        )
        .catch((error: AxiosError) => reject(error.response ?? error.message));
    });
  }

  private useDebugLogs() {
    this.client.interceptors.request.use((config) => {
      console.info("Calling API", config.url, config.params);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        console.info(
          "Got response from API",
          response.config.url,
          response.data
        );
        return response;
      },
      (error: AxiosError) => {
        console.info(
          "There was an error calling API",
          error.request?.url,
          error.response?.status,
          error.message
        );
        return Promise.reject(error);
      }
    );
  }

  private useAuth(
    tokenFactory: () => Promise<string | undefined>,
    debug?: boolean
  ) {
    this.client.interceptors.request.use(async (config) => {
      const token = await tokenFactory();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (debug) {
        console.log(
          "No token returned by factory, skipping Authorization header"
        );
      }

      return config;
    });
  }
}
