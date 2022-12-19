import {
  ChangeEvent,
  createContext,
  MutableRefObject,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { AxelarChain, chainsDetailsData, relayerGasFeeInUusdc } from "../config/chains";
import { ActionMeta, SelectInstance, SingleValue } from "react-select";
import { BaseToken, baseTokens } from "../config/tokens";
import useList from "../hooks/useList";
import { useApiService } from "./ApiService";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { useModal } from "../hooks/useModal";
import paginateTokensList from "../utils/paginateTokensList";
import ERC20 from '../contracts/interfaces/IERC20.sol/IERC20.json';
import { BigNumber, constants } from "ethers";
import { prepareSendTransaction, prepareWriteContract, sendTransaction, writeContract, fetchFeeData, fetchBalance, readContract } from "@wagmi/core";
import Error from "next/error";
import { useNotification } from "./Notification";
import getGasCost from "../utils/getGasCost";
import getNativeTokenId from "../utils/getNativeTokenId";
import { AxelarAssetTransfer, AxelarGMPRecoveryAPI, AxelarQueryAPI, Environment } from "@axelar-network/axelarjs-sdk";
import getNativeSymbol from "../utils/getNativeSymbol";
import getExplorerUrl from "../utils/getExplorerUrl";
import processTokenAmount from "../utils/processTokenAmount";
import { SwapCallDataParamsV2, SwapRouter } from "../utils/apiClient";

interface SwapContextInterface {
  chains: AxelarChain[];
  onChangeSourceChain: (newValue: SingleValue<ChainOption>, actionMeta: ActionMeta<ChainOption>) => void;
  onChangeDestinationChain: (newValue: SingleValue<ChainOption>, actionMeta: ActionMeta<ChainOption>) => void;
  fromTokensList: MutableRefObject<BaseToken[] | undefined>;
  toTokensList: MutableRefObject<BaseToken[] | undefined>;
  fromToken?: BaseToken;
  toToken?: BaseToken;
  tokenBridgeSource: BaseToken;
  tokenBridgeDestination: BaseToken;
  slippage: string;
  allowPartialFill: boolean;
  onChangeSlippage: (e: ChangeEvent<HTMLInputElement>) => void;
  onCheckedAllowPartialFill: (e: ChangeEvent<HTMLInputElement>) => void;
  sourceChainsRef: RefObject<SelectInstance<ChainOption>>
  destinationChainsRef: RefObject<SelectInstance<ChainOption>>
  fromTokenRef: RefObject<SelectInstance<BaseToken>>
  toTokenRef: RefObject<SelectInstance<BaseToken>>
  fromTokenAmount: Amount;
  toTokenAmount: Amount;
  onChangeFromTokenAmount: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeFromToken: (newValue: SingleValue<BaseToken>, actionMeta: ActionMeta<BaseToken>) => void;
  onChangeToToken: (newValue: SingleValue<BaseToken>, actionMeta: ActionMeta<BaseToken>) => void;
  openModalFromToken: boolean;
  showModalFromToken: () => void;
  openModalToToken: boolean;
  showModalToToken: () => void;
  openModalTransaction: boolean;
  onCloseModalTransaction: () => void;
  incrementPageFromTokensList: () => void;
  incrementPageToTokensList: () => void;
  maxApproveAmount: boolean;
  onChangeMaxApproveAmount: (e: ChangeEvent<HTMLInputElement>) => void;
  steps: Steps;
  readySwap: boolean;
  bridgeAndSwap: () => Promise<void>;
  txCost: TxCost;
  insufficientBalance: boolean;
  sourceChain: AxelarChain;
  destinationChain: AxelarChain;
  txHashUrl: { swapBeforeBridge: string; bridge: string; swapAfterBridge: string; };
}

export type ChainOption = { label: string; value: number; image: string };

type Steps = { [key: string]: { state: 'loading' | 'completed' | 'failed' } };

type TransactionError = { reason: string; step: string };

type TxCost = { value: number; state: 'fetching' | 'done' };

type Amount = { value: BigNumber; raw: string; formated: string; float: number };

interface Props {
  children: ReactNode;
};

const SwapContext = createContext<SwapContextInterface | undefined>(undefined);

const stepsInitialState: Steps = {
  swapBeforeBridge: { state: 'loading' },
  bridge: { state: 'loading' },
  swapAfterBridge: { state: 'loading' }
};

const axelarQuery = new AxelarQueryAPI({ environment: Environment.MAINNET });
const axelarAssetTransfer = new AxelarAssetTransfer({ environment: Environment.MAINNET });
const axelarGMPRecovery = new AxelarGMPRecoveryAPI({ environment: Environment.MAINNET });

const SwapProvider = ({ children }: Props) => {
  const apiService = useApiService();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const [sourceChain, setSourceChain] = useState<AxelarChain>(chainsDetailsData['ethereum']);
  const [destinationChain, setDestinationChain] = useState<AxelarChain>(chainsDetailsData['polygon']);
  const [fromToken, setFromToken] = useState<BaseToken>();
  const [toToken, setToToken] = useState<BaseToken>();
  const { switchNetwork, switchNetworkAsync, error: errorSwitchNetwork, isLoading: isLoadingSwitchNetwork } = useSwitchNetwork();
  const { list: fromTokensList, addItem: addFromTokenToList, clear: clearFromTokensList, setList: setFromTokensList } = useList<BaseToken>();
  const { list: toTokensList, addItem: addToTokenToList, clear: clearToTokensList, setList: setToTokensList } = useList<BaseToken>();
  const [slippage, setSlippage] = useState("1");
  const [allowPartialFill, setAllowPartialFill] = useState(true);
  const sourceChainsRef = useRef<SelectInstance<ChainOption>>(null);
  const destinationChainsRef = useRef<SelectInstance<ChainOption>>(null);
  const fromTokenRef = useRef<SelectInstance<BaseToken>>(null);
  const toTokenRef = useRef<SelectInstance<BaseToken>>(null);
  const [fromTokenAmount, setFromTokenAmount] = useState<Amount>(processTokenAmount('1', 18));
  const [fromTokenBalance, setFromTokenBalance] = useState<Amount>(processTokenAmount());
  const [tokenBridgeAmount, setTokenBridgeAmount] = useState<Amount>(processTokenAmount());
  const [toTokenAmount, setToTokenAmount] = useState<Amount>(processTokenAmount());
  const [insufficientTokenBridge, setInsufficientTokenBridge] = useState<boolean | undefined>();
  const { open: openModalFromToken, showModal: showModalFromToken, hideModal: hideModalFromToken } = useModal();
  const { open: openModalToToken, showModal: showModalToToken, hideModal: hideModalToToken } = useModal();
  const { open: openModalTransaction, showModal: showModalTransaction, hideModal: hideModalTransaction } = useModal();
  const [steps, setSteps] = useState<Steps>(stepsInitialState)
  const [pageFromToken, setPageFromToken] = useState(1);
  const [pageToToken, setPageToToken] = useState(1);
  const [maxApproveAmount, setMaxApproveAmount] = useState(true);
  const [txCost, setTxCost] = useState<TxCost>({ value: 0, state: 'fetching' })
  const { setNotification } = useNotification();
  const [txHashUrl, setTxHashUrl] = useState<{ swapBeforeBridge: string; bridge: string; swapAfterBridge: string; }>({
    swapBeforeBridge: '',
    bridge: '',
    swapAfterBridge: ''
  });

  const incrementPageFromTokensList = () => {
    setPageFromToken((prev) => prev + 1);
  };

  const incrementPageToTokensList = () => {
    setPageToToken((prev) => prev + 1);
  };

  const paginate = (listName: 'from' | 'to', chainName: string, page: number) => {
    const tokens = baseTokens[chainName];
    const paginatedTokens = paginateTokensList(tokens, page);

    if (listName === 'from') {
      if (page === 1) {
        setFromTokensList(paginatedTokens)
      } else {
        for (const token of paginatedTokens) {
          addFromTokenToList(token)
        }
      }
      return;
    }
    if (listName === 'to') {
      if (page === 1) {
        setToTokensList(paginatedTokens)
      } else {
        for (const token of paginatedTokens) {
          addToTokenToList(token)
        }
      }
      return;
    }
  };

  const changeSteps = (step: string, state: 'loading' | 'completed' | 'failed') => {
    setSteps((prev) => ({ ...prev, [step]: { state } }))
  }

  const resetSteps = () => {
    setSteps(stepsInitialState);
  }

  useEffect(() => {
    paginate('from', sourceChain.name.toLowerCase(), pageFromToken)
  }, [pageFromToken]);

  useEffect(() => {
    paginate('to', destinationChain.name.toLowerCase(), pageToToken)
  }, [pageToToken]);

  const tokenBridgeSource = useMemo(() => {
    return baseTokens[sourceChain.name.toLowerCase()].find((token) => token.symbol === 'USDC' || token.symbol === 'axlUSDC')!
  }, [sourceChain]);

  const tokenBridgeDestination = useMemo(() => {
    return baseTokens[destinationChain.name.toLowerCase()!].find((token) => token.symbol === 'USDC' || token.symbol === 'axlUSDC')!
  }, [destinationChain]);

  const onChangeFromTokenAmount = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || !(parseInt(e.target.value) > 0) && !e.target.value.includes('.')) {
      setFromTokenAmount(processTokenAmount())
      setFromTokenAmount((prev) => ({ ...prev, formated: '0' }))

      return;
    }
    let currentValue = e.target.value
    if (currentValue.startsWith('0') && currentValue.charAt(1) !== '.') {
      currentValue = e.target.value.slice(1)
    }

    const regex = /^\d+\.?\d{0,6}$/;
    if (regex.test(currentValue)) {
      setFromTokenAmount(processTokenAmount(currentValue, fromToken?.decimals))
      setFromTokenAmount((prev) => ({ ...prev, formated: currentValue }))

    }
  }, [fromToken]);

  const onChangeSlippage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setSlippage("")
      return
    }
    if (parseInt(e.target.value) > 50) {
      return;
    }
    const regex = /^\d{0,2}\.?\d{0,3}$/
    if (regex.test(e.target.value)) {
      setSlippage(e.target.value)
    }
  };

  const onChangeMaxApproveAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setMaxApproveAmount(e.target.checked)
  };

  const onCheckedAllowPartialFill = (e: ChangeEvent<HTMLInputElement>) => {
    setAllowPartialFill(e.target.checked);
  };

  const onChangeSourceChain = (newValue: SingleValue<ChainOption>, actionMeta: ActionMeta<ChainOption>) => {
    if (newValue) {
      const selectedChain = chainsDetailsData[newValue.label.toLowerCase()];
      setSourceChain(selectedChain);
      if (switchNetwork) {
        switchNetwork(newValue.value)
      }
    }
  };

  const onChangeDestinationChain = (newValue: SingleValue<ChainOption>, actionMeta: ActionMeta<ChainOption>) => {
    if (newValue) {
      const selectedChain = chainsDetailsData[newValue.label.toLowerCase()];
      setDestinationChain(selectedChain);

    }
  };

  const onChangeFromToken = (newValue: SingleValue<BaseToken>, actionMeta: ActionMeta<BaseToken>) => {
    if (newValue) {
      setFromToken(newValue);
      hideModalFromToken();
      setPageFromToken(1);
    }
  };

  const onChangeToToken = (newValue: SingleValue<BaseToken>, actionMeta: ActionMeta<BaseToken>) => {
    if (newValue) {
      setToToken(newValue);
      hideModalToToken();
      setPageToToken(1);
    }
  };
  // <<<<<<<<
  const onCloseModalTransaction = () => {
    hideModalTransaction()
    setToTokenAmount(processTokenAmount())
    resetSteps()
    setTxHashUrl({
      swapAfterBridge: '',
      bridge: '',
      swapBeforeBridge: ''
    })
  }

  const setSelectedSourceChain = (newValue: AxelarChain) => {
    sourceChainsRef.current?.selectOption({ label: newValue.name, value: newValue.chainId, image: newValue.image })
  };

  const setSelectedDestinationChain = (newValue: AxelarChain) => {
    destinationChainsRef.current?.selectOption({ label: newValue.name, value: newValue.chainId, image: newValue.image })
  };

  useEffect(() => {
    const selectedSourceChain = Object.values(chainsDetailsData).find((x) => x.chainId === (chain?.id ?? 1));
    if (selectedSourceChain) {
      setSelectedSourceChain(selectedSourceChain)
      const destChainIndex = Object.values(chainsDetailsData).indexOf(selectedSourceChain) + 1;
      let destChain: AxelarChain;
      if (destChainIndex === Object.values(chainsDetailsData).length) {
        destChain = Object.values(chainsDetailsData)[0];
      } else {
        destChain = Object.values(chainsDetailsData)[destChainIndex]
      }
      setSelectedDestinationChain(destChain);
    }
  }, [chain])

  useEffect(() => {
    if (!sourceChain) return;
    const wrapedNative = getNativeSymbol(sourceChain.name.toLocaleLowerCase())
    clearFromTokensList();
    const chainName = sourceChain.name.toLowerCase()
    const fromTokens = baseTokens[chainName];
    setFromTokensList(fromTokens.slice(0, 50))
    const fromTokenSelected = fromTokens.find((x) => x.symbol === wrapedNative);
    if (fromTokenSelected) {
      fromTokenRef.current?.selectOption(fromTokenSelected)
      setFromToken(fromTokenSelected)
    }
  }, [sourceChain])

  useEffect(() => {
    if (!destinationChain) return;
    clearToTokensList();
    const chainName = destinationChain.name.toLowerCase()
    const toTokens = baseTokens[chainName];
    setToTokensList(toTokens.slice(0, 50))
    const toTokenSelected = toTokens.find((x) => x.symbol.endsWith('USDC'));

    if (toTokenSelected) {
      toTokenRef.current?.selectOption(toTokenSelected)
      setToToken(toTokenSelected)

    }
    if (destinationChain === sourceChain) {
      setNotification({ title: 'Error', description: 'source chain dont equal to destination chain', type: 'error' })
    }
  }, [destinationChain])

  useEffect(() => {
    if (!errorSwitchNetwork || !chain) return;
    const selectedSourceChain = Object.values(chainsDetailsData).find((x) => x.chainId === chain.id);
    if (selectedSourceChain) {
      setSelectedSourceChain(selectedSourceChain)
    }
    setNotification({ title: 'Switch Network', description: errorSwitchNetwork.message, type: 'error' });
  }, [errorSwitchNetwork])

  const fetchTokenBalance = useCallback(async (token: BaseToken) => {
    if (!address || isLoadingSwitchNetwork) return;
    return await fetchBalance({
      address,
      token: token.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? token.address as `0x${string}` : undefined,
      chainId: sourceChain.chainId

    })
  }, [address, sourceChain, isLoadingSwitchNetwork]);

  const calculateGasPriceInUsd = useCallback(async (chainId: number, gasLimit: string) => {
    const nativeTokenId = getNativeTokenId(chainId.toString());
    const { gasPrice } = await fetchFeeData({ chainId: chainId });
    let nativeTokenPrice = '0';
    try {
      nativeTokenPrice = (await apiService.getNativeTokenPrice({ ids: nativeTokenId, vs_currencies: 'usd' }))[nativeTokenId]['usd']
    } catch (error) {
      console.log('call coingecko api fail')
    }
    return getGasCost(gasLimit, gasPrice ?? BigNumber.from(formatUnits(20, 'gwei')), nativeTokenPrice)

  }, [apiService])

  const fixedTransferFee = useMemo(() => {
    if (isLoadingSwitchNetwork) {
      return ''
    }
    return BigNumber.from(relayerGasFeeInUusdc[sourceChain.name]).add(relayerGasFeeInUusdc[destinationChain.name]).toString()
  }, [sourceChain, destinationChain, isLoadingSwitchNetwork])

  const getQuote = useCallback(async () => {

    let txCostValue = 0;
    let txCostState: 'fetching' | 'done' = 'fetching';

    if (
      !fromToken ||
      !toToken ||
      !fromTokenAmount.value.gt(0) ||
      !(fixedTransferFee !== '') ||
      isLoadingSwitchNetwork ||
      sourceChain === destinationChain ||
      openModalFromToken ||
      openModalToToken ||
      openModalTransaction
    ) {
      setTokenBridgeAmount(processTokenAmount())
      setToTokenAmount(processTokenAmount())
      setTxCost({ value: txCostValue, state: txCostState });
      return;
    };
    const { gasPrice: gasPriceSource } = await fetchFeeData({ chainId: sourceChain.chainId })
    const { gasPrice: gasPriceDestination } = await fetchFeeData({ chainId: destinationChain.chainId })

    const preset = 'maxReturnResult'
    setTokenBridgeAmount(processTokenAmount())
    setToTokenAmount(processTokenAmount())
    setTxCost({ value: txCostValue, state: txCostState });
    const costForTransferBridge = await calculateGasPriceInUsd(sourceChain.chainId, '70000')
    txCostValue = parseFloat(formatUnits(fixedTransferFee, tokenBridgeSource.decimals))
    txCostValue = txCostValue + costForTransferBridge;

    if (fromToken.symbol !== tokenBridgeSource.symbol) {
      try {
        const res1 = await apiService.getQuoteV2(
          sourceChain.chainId, {
          fromTokenAddress: fromToken.address,
          toTokenAddress: tokenBridgeSource.address,
          amount: fromTokenAmount.raw,
          preset,
          gasPrice: gasPriceSource?.toString() ?? '150000000000'
        })

        const estimatedGasRes1 = await calculateGasPriceInUsd(sourceChain.chainId, res1.bestResult.gasUnitsConsumed);
        txCostValue = txCostValue + estimatedGasRes1

        if (toToken.symbol !== tokenBridgeDestination.symbol) {
          try {
            const res2 = await apiService.getQuoteV2(destinationChain.chainId, {
              fromTokenAddress: tokenBridgeDestination.address,
              toTokenAddress: toToken.address,
              amount: res1.bestResult.toTokenAmount,
              preset,
              gasPrice: gasPriceDestination?.toString() ?? '150000000000'
            })
            const estimatedGasRes2 = await calculateGasPriceInUsd(destinationChain.chainId, res2.bestResult.gasUnitsConsumed)
            txCostValue = txCostValue + estimatedGasRes2
            txCostState = 'done'
            setTxCost({ value: txCostValue, state: txCostState })
            setTokenBridgeAmount(processTokenAmount(BigNumber.from(res1.bestResult.toTokenAmount), tokenBridgeSource.decimals))
            setToTokenAmount(processTokenAmount(BigNumber.from(res2.bestResult.toTokenAmount), toToken.decimals))
          } catch (err: any) {
            setNotification({ title: 'getQuote', description: err.data?.reason ?? err.data?.description ?? null, type: 'error' })
            setTokenBridgeAmount(processTokenAmount())
            setToTokenAmount(processTokenAmount())
            console.log(err)
            return;
          }
        } else {
          txCostState = 'done'
          setTxCost({ value: txCostValue, state: txCostState })
          setTokenBridgeAmount(processTokenAmount(BigNumber.from(res1.bestResult.toTokenAmount), tokenBridgeSource.decimals))
          setToTokenAmount(processTokenAmount(BigNumber.from(res1.bestResult.toTokenAmount), tokenBridgeSource.decimals))
        }
      } catch (err: any) {
        setNotification({ title: 'getQuote', description: err.data?.reason ?? err.data?.description ?? null, type: 'error' })
        setTokenBridgeAmount(processTokenAmount())
        setToTokenAmount(processTokenAmount())
        console.log(err)
        return;
      }

    } else {
      if (toToken.symbol !== tokenBridgeDestination.symbol) {
        try {
          const res = await apiService.getQuoteV2(destinationChain.chainId, {
            fromTokenAddress: tokenBridgeDestination.address,
            toTokenAddress: toToken.address,
            amount: fromTokenAmount.raw,
            preset,
            gasPrice: gasPriceDestination?.toString() ?? '150000000000'
          })
          const estimatedGasRes = await calculateGasPriceInUsd(destinationChain.chainId, res.bestResult.gasUnitsConsumed)
          txCostValue = txCostValue + estimatedGasRes
          txCostState = 'done'
          setTxCost({ value: txCostValue, state: txCostState })
          setTokenBridgeAmount(fromTokenAmount)
          setToTokenAmount(processTokenAmount(BigNumber.from(res.bestResult.toTokenAmount), toToken.decimals))
        } catch (err: any) {
          setNotification({ title: 'getQuote', description: err.data?.reason ?? err.data?.description ?? null, type: 'error' })
          setTokenBridgeAmount(processTokenAmount())
          setToTokenAmount(processTokenAmount())
          console.log(err)
          return;
        }
      } else {
        txCostState = 'done'
        setTxCost({ value: txCostValue, state: txCostState })
        setTokenBridgeAmount(fromTokenAmount)
        setToTokenAmount(fromTokenAmount)
      }
    }

  }, [
    fromToken,
    tokenBridgeSource,
    apiService,
    fromTokenAmount,
    toToken,
    tokenBridgeDestination,
    isLoadingSwitchNetwork,
    openModalFromToken,
    openModalToToken,
    openModalTransaction,
    fixedTransferFee
  ]);
  // fetch fromToken balance
  useEffect(() => {
    if (!fromToken) return;
    fetchTokenBalance(fromToken).then(res => setFromTokenBalance(processTokenAmount(res?.value, fromToken.decimals)))
  }, [fetchTokenBalance, fromToken])

  // fetch tokenBridge balance and calculate if sufficient for pay transfer fee
  useEffect(() => {
    if (!(fixedTransferFee !== '') || !tokenBridgeAmount.value.gt(0)) return;

    fetchTokenBalance(tokenBridgeSource).then((res) => {
      const tokenBridgeBalanceAfterSwap = res?.value.add(tokenBridgeAmount.value);
      const tokenBridgeAmountPlusFee = tokenBridgeAmount.value.add(fixedTransferFee);
      setInsufficientTokenBridge(tokenBridgeBalanceAfterSwap?.lt(tokenBridgeAmountPlusFee))
    });
  }, [tokenBridgeAmount, tokenBridgeSource, fixedTransferFee]);

  const insufficientBalance = useMemo(() => {
    if (!(fixedTransferFee !== '') || !fromTokenAmount.value.gt(0) || !tokenBridgeAmount.value.gt(0) || !fromToken) return true;

    if (insufficientTokenBridge) {
      const ratio = fromTokenAmount.float / tokenBridgeAmount.float
      const transerFeeInFromToken = parseUnits(
        (ratio * parseFloat(formatUnits(fixedTransferFee, tokenBridgeSource.decimals))).toFixed(fromToken.decimals),
        fromToken.decimals
      )
      return fromTokenAmount.value.add(transerFeeInFromToken).gt(fromTokenBalance.value);
    } else {
      return fromTokenAmount.value.gt(fromTokenBalance.value)
    }

  }, [
    fromToken,
    fromTokenAmount,
    fromTokenBalance,
    insufficientTokenBridge,
    tokenBridgeAmount,
    fixedTransferFee,
    tokenBridgeSource
  ]);

  useEffect(() => {
    getQuote()
    const interval = setInterval(async () => await getQuote(), 8000)
    return () => {
      clearInterval(interval)
    }
  }, [getQuote])

  const readySwap = useMemo(() => {
    return !!(fromToken && toToken && address && fromTokenAmount.value.gt(0) && sourceChain !== destinationChain && !insufficientBalance)
  }, [
    fromToken,
    toToken,
    fromTokenAmount,
    address,
    sourceChain,
    destinationChain,
    insufficientBalance
  ])

  const needApproveforSwap = useCallback(async (chainId: number, token: BaseToken, amount: number) => {
    if (token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') return false;
    const { allowance } = await apiService.getAllowance(chainId, { tokenAddress: token.address, address: address as string })
    return amount > allowance;

  }, [address, apiService]);

  const getApproveCallData = async (chainId: number, token: BaseToken, amount: string) => {
    let parsedAmount = amount;
    if (maxApproveAmount) {
      parsedAmount = constants.MaxUint256.toString()
    }
    return await apiService.getApproveCallData(chainId, { tokenAddress: token.address, amount: parsedAmount })
  };

  const getSwapCallData = async (chainId: number, params: Omit<SwapCallDataParamsV2, 'minTokensAmount'>) => {
    const slippageInToToken = BigNumber.from(params.guaranteedAmount.slice(0, params.guaranteedAmount.length - 2))

    return await apiService.getSwapCallDataV2(chainId, {
      ...params,
      minTokensAmount: BigNumber.from(params.guaranteedAmount).sub(slippageInToToken).sub(1).toString(),
      ethValue: params.fromTokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? params.amount : undefined,
      allowUnoSwap: true,
      allowPartialFill: true,
      enableEstimate: true,
      protectPMM: true,
    });
  };

  const swapBeforeBridge = useCallback(async () => {
    if (!(fixedTransferFee !== '') || !sourceChain || !fromToken || !address ) throw new Error<{ reason: string }>({ reason: 'missin params', statusCode: 1 });
    let currentStep = `swap before bridge: ${fromToken.symbol} to ${tokenBridgeSource.symbol}`
    try {
      if (fromToken.symbol !== tokenBridgeSource.symbol) {
        const needApprove = await needApproveforSwap(sourceChain.chainId, fromToken, fromTokenAmount.float);

        let fromTokenAmountParsed = fromTokenAmount.raw

        if (insufficientTokenBridge) {
          const ratio = fromTokenAmount.float / tokenBridgeAmount.float
          const transerFeeInFromToken = parseUnits(
            (ratio * parseFloat(formatUnits(fixedTransferFee, tokenBridgeSource.decimals))).toFixed(fromToken.decimals),
            fromToken.decimals
          )
          fromTokenAmountParsed = fromTokenAmount.value.add(transerFeeInFromToken).toString()
        }

        if (needApprove) {
          const approveCallData = await getApproveCallData(sourceChain.chainId, fromToken, fromTokenAmountParsed);
          const config = await prepareSendTransaction({
            request: {
              to: approveCallData.to,
              data: approveCallData.data,
              value: approveCallData.value,
            }
          })
          currentStep = `approve ${fromToken.symbol} for swap`;
          const tx = await sendTransaction(config);
          await tx.wait()
          console.log('approve hash', tx.hash)
        }

        const { gasPrice } = await fetchFeeData({ chainId: sourceChain.chainId })

        const quote = await apiService.getQuoteV2(sourceChain.chainId, {
          fromTokenAddress: fromToken.address,
          toTokenAddress: tokenBridgeSource.address,
          amount: fromTokenAmountParsed,
          preset: 'maxReturnResult',
          gasPrice: gasPrice?.toString() ?? '150000000000'
        })

        const swapCallData = await getSwapCallData(sourceChain.chainId, {
          fromTokenAddress: fromToken.address,
          toTokenAddress: tokenBridgeSource.address,
          amount: fromTokenAmountParsed,
          guaranteedAmount: quote.bestResult.toTokenAmount,
          allowedSlippagePercent: parseFloat(slippage),
          walletAddress: address as string,
          pathfinderData: {
            routes: quote.bestResult.routes,
            mainParts: quote.preset.mainParts,
            splitParts: quote.preset.subParts,
            deepLevel: quote.preset.deepLevel
          },
          gasPrice: gasPrice?.toString() ?? '150000000000'
        });
        const spender = await apiService.getSpenderAddress(sourceChain.chainId)

        const config = await prepareSendTransaction({
          request: {
            data: swapCallData.data,
            from: address,
            gasLimit: swapCallData.gasLimit,
            to: spender.address,
            value: swapCallData.ethValue
          }
        })

        currentStep = `swap before bridge: ${fromToken.symbol} to ${tokenBridgeSource.symbol}`
        const tx = await sendTransaction(config);
        await tx.wait(2)
        console.log('swap before bridge hash', tx.hash)
        setTxHashUrl((prev) => ({ ...prev, swapBeforeBridge: `${getExplorerUrl(sourceChain.chainId)}/tx/${tx.hash}` }));
      }
    } catch (err: any) {
      throw new Error<TransactionError>({ step: 'swapBeforeBridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });
    }

  }, [sourceChain, fromToken, fromTokenAmount, tokenBridgeAmount, address, slippage, tokenBridgeSource, fixedTransferFee])

  const swapAfterBridge = useCallback(async () => {
    if (!sourceChain || !tokenBridgeAmount || !address || !toToken || !destinationChain || !switchNetworkAsync) throw new Error<{ reason: string }>({ reason: 'missing params', statusCode: 1 });
    let currentStep = `swap after bridge: ${tokenBridgeDestination.symbol} to ${toToken.symbol}`
    let currentChainId = sourceChain.chainId;
    try {
      if (toToken.symbol !== tokenBridgeDestination.symbol) {
        currentChainId = (await switchNetworkAsync(destinationChain.chainId)).id
        const needApprove = await needApproveforSwap(currentChainId, tokenBridgeDestination, tokenBridgeAmount.float);
        if (needApprove) {
          const approveCallData = await getApproveCallData(currentChainId, tokenBridgeDestination, tokenBridgeAmount.formated);
          const config = await prepareSendTransaction({
            request: {
              to: approveCallData.to,
              data: approveCallData.data,
              value: approveCallData.value,
            }
          })
          currentStep = `approve ${tokenBridgeDestination.symbol} for swap`;
          const tx = await sendTransaction(config);
          await tx.wait(1)
          console.log('approve hash', tx.hash)
        }

        const { gasPrice } = await fetchFeeData({ chainId: currentChainId })

        const quote = await apiService.getQuoteV2(currentChainId, {
          fromTokenAddress: tokenBridgeDestination.address,
          toTokenAddress: toToken.address,
          amount: tokenBridgeAmount.formated,
          preset: 'maxReturnResult',
          gasPrice: gasPrice?.toString() ?? '150000000000'
        })

        const swapCallData = await getSwapCallData(currentChainId, {
          fromTokenAddress: tokenBridgeDestination.address,
          toTokenAddress: toToken.address,
          amount: tokenBridgeAmount.formated,
          guaranteedAmount: quote.bestResult.toTokenAmount,
          allowedSlippagePercent: parseFloat(slippage),
          walletAddress: address as string,
          pathfinderData: {
            routes: quote.bestResult.routes,
            mainParts: quote.preset.mainParts,
            splitParts: quote.preset.subParts,
            deepLevel: quote.preset.deepLevel
          },
          gasPrice: gasPrice?.toString() ?? '150000000000'
        });
        const spender = await apiService.getSpenderAddress(currentChainId)

        const config = await prepareSendTransaction({
          request: {
            data: swapCallData.data,
            from: address,
            gasLimit: swapCallData.gasLimit,
            to: spender.address,
            value: swapCallData.ethValue
          }
        })

        currentStep = `swap after bridge: ${tokenBridgeDestination.symbol} to ${toToken.symbol}`
        const tx = await sendTransaction(config);
        await tx.wait(2)
        console.log('swap after bridge hash', tx.hash)
        setTxHashUrl((prev) => ({ ...prev, swapAfterBridge: `${getExplorerUrl(currentChainId)}/tx/${tx.hash}` }));

      }
    } catch (err: any) {
      throw new Error<TransactionError>({ step: 'swapAfterBridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });

    }

  }, [sourceChain, destinationChain, tokenBridgeAmount, address, toToken, slippage, switchNetworkAsync])

  const bridge = useCallback(async () => {
    if (!(fixedTransferFee !== '') || !fromToken || !address) throw new Error<{ reason: string }>({ reason: 'missin params', statusCode: 1 });
    let currentStep = 'bridge';
    const assetDenom = 'uusdc';
    try {

      const depositAddress = await axelarAssetTransfer.getDepositAddress(
        sourceChain.name,
        destinationChain.name,
        address,
        assetDenom
      );
      const configTransfer = await prepareWriteContract({
        address: tokenBridgeSource.address,
        abi: ERC20.abi,
        functionName: 'transfer',
        args: [
          depositAddress,
          tokenBridgeAmount.value.add(fixedTransferFee),
        ],
      });

      const txBridge = await writeContract(configTransfer);
      await txBridge.wait(2)
      console.log('bridge bridge hash', txBridge.hash)
      currentStep = `await receive ${tokenBridgeDestination.symbol} after bridge`

      const balanceAfterBridge = await fetchBalance({
        address: address,
        token: tokenBridgeDestination.address as `0x${string}`,
        chainId: destinationChain.chainId
      });

      while (true) {
        const newBalance = await fetchBalance({
          address: address,
          token: tokenBridgeDestination.address as `0x${string}`,
          chainId: destinationChain.chainId
        });
        if (balanceAfterBridge && newBalance.value.gte(balanceAfterBridge.value.add(tokenBridgeAmount.value))) break;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      setTxHashUrl((prev) => ({ ...prev, bridge: `${getExplorerUrl(sourceChain.chainId)}/tx/${txBridge.hash}` }));

    } catch (err: any) {
      throw new Error<TransactionError>({ step: 'bridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });
    }
  }, [sourceChain, destinationChain, tokenBridgeSource, tokenBridgeDestination, tokenBridgeAmount, address, fixedTransferFee])

  const bridgeAndSwap = useCallback(async () => {
    showModalTransaction()
    try {
      await swapBeforeBridge();
      changeSteps('swapBeforeBridge', 'completed')
      await bridge()
      changeSteps('bridge', 'completed')
      await swapAfterBridge();
      changeSteps('swapAfterBridge', 'completed')
    } catch (error: any) {
      setNotification({ title: `Transaction`, description: error.props.reason, type: 'error' })
      changeSteps(error.props.step, 'failed')
    }
  }, [swapBeforeBridge, bridge, swapAfterBridge])

  return (
    <SwapContext.Provider value={{
      chains: Object.values(chainsDetailsData),
      onChangeSourceChain,
      onChangeDestinationChain,
      fromTokensList,
      toTokensList,
      fromToken,
      toToken,
      tokenBridgeSource,
      tokenBridgeDestination,
      slippage,
      allowPartialFill,
      onChangeSlippage,
      onCheckedAllowPartialFill,
      sourceChainsRef,
      destinationChainsRef,
      fromTokenRef,
      toTokenRef,
      fromTokenAmount,
      toTokenAmount,
      onChangeFromTokenAmount,
      onChangeFromToken,
      onChangeToToken,
      openModalFromToken,
      showModalFromToken,
      openModalToToken,
      showModalToToken,
      openModalTransaction,
      onCloseModalTransaction,
      incrementPageFromTokensList,
      incrementPageToTokensList,
      maxApproveAmount,
      onChangeMaxApproveAmount,
      bridgeAndSwap,
      readySwap,
      steps,
      txCost,
      insufficientBalance,
      sourceChain,
      destinationChain,
      txHashUrl
    }}>
      {children}
    </SwapContext.Provider>
  );
};

const useSwap = () => useContext(SwapContext)!;

export { SwapProvider, useSwap };
