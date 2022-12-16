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
import { AxelarChain, chainsDetailsData } from "../config/chains";
import { ActionMeta, SelectInstance, SingleValue } from "react-select";
import { BaseToken, baseTokens } from "../config/tokens";
import useList from "../hooks/useList";
import { useApiService } from "./ApiService";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { useModal } from "../hooks/useModal";
import paginateTokensList from "../utils/paginateTokensList";
import ERC20 from '../contracts/interfaces/IERC20.sol/IERC20.json';
import AxelarGateway from '../contracts/interfaces/IAxelarGateway.sol/IAxelarGateway.json';
import { BigNumber, constants } from "ethers";
import { prepareSendTransaction, prepareWriteContract, sendTransaction, writeContract, fetchFeeData, fetchBalance, readContract } from "@wagmi/core";
import Error from "next/error";
import { useNotification } from "./Notification";
import getGasCost from "../utils/getGasCost";
import getNativeTokenId from "../utils/getNativeTokenId";
import formatDecimals from "../utils/formatDecimals";
import { AxelarAssetTransfer, AxelarQueryAPI, CHAINS, Environment } from "@axelar-network/axelarjs-sdk";
import getNativeSymbol from "../utils/getNativeSymbol";

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
  fromTokenAmount: string;
  toTokenAmount: string;
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
}

export type ChainOption = { label: string; value: number; image: string };
type Steps = { [key: string]: { state: 'loading' | 'completed' | 'failed' } };
const SwapContext = createContext<SwapContextInterface | undefined>(
  undefined
);
type TransactionError = { reason: string; step: string };
type TxCost = { value: number; state: 'fetching' | 'done' };
const stepsInitialState: Steps = {
  swapBeforeBridge: {
    state: 'loading'
  },
  bridge: {
    state: 'loading'
  },
  swapAfterBridge: {
    state: 'loading'
  }
}

interface Props {
  children: ReactNode;
};

const axelarQuery = new AxelarQueryAPI({
  environment: Environment.MAINNET,
});

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
  const [slippage, setSlippage] = useState("0.5");
  const [allowPartialFill, setAllowPartialFill] = useState(true);
  const sourceChainsRef = useRef<SelectInstance<ChainOption>>(null);
  const destinationChainsRef = useRef<SelectInstance<ChainOption>>(null);
  const fromTokenRef = useRef<SelectInstance<BaseToken>>(null);
  const toTokenRef = useRef<SelectInstance<BaseToken>>(null);
  const [fromTokenAmount, setFromTokenAmount] = useState("1");
  const [fromTokenBalance, setFromTokenBalance] = useState('0');
  const [tokenBridgeAmount, setTokenBridgeAmount] = useState('');
  const [toTokenAmount, setToTokenAmount] = useState("");
  const [transerFee, setTransferFee] = useState<{ inTokenBridge: string; inFromToken: string; inUsd: string }>({ inTokenBridge: '0', inFromToken: '0', inUsd: '0' });
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

  const onChangeFromTokenAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(e.target.value)) {
      setFromTokenAmount(e.target.value)
    }
  };

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

  const onCloseModalTransaction = () => {
    hideModalTransaction()
    setToTokenAmount('')
    resetSteps()
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
    if (!address) return;
    return await fetchBalance({
      address,
      token: token.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? token.address as `0x${string}` : undefined,
      chainId: sourceChain.chainId

    })
  }, [address, sourceChain]);

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

  const getQuote = useCallback(async () => {

    let txCostValue = 0;
    let txCostState: 'fetching' | 'done' = 'fetching';

    if (!fromToken || !toToken || !fromTokenAmount || !(parseFloat(fromTokenAmount) > 0) || isLoadingSwitchNetwork || sourceChain === destinationChain) {
      setToTokenAmount('')
      setTxCost({ value: txCostValue, state: txCostState });
      return;
    };

    setTxCost({ value: txCostValue, state: txCostState });
    txCostValue = parseInt(transerFee.inUsd);

    if (fromToken.symbol !== tokenBridgeSource.symbol) {
      try {
        const res1 = await apiService.getQuote(
          sourceChain.chainId, {
          fromTokenAddress: fromToken.address,
          toTokenAddress: tokenBridgeSource.address,
          amount: parseUnits(fromTokenAmount, fromToken.decimals).toString()
        })

        const estimatedGasRes1 = await calculateGasPriceInUsd(sourceChain.chainId, res1.estimatedGas);
        txCostValue = txCostValue + estimatedGasRes1

        if (toToken.symbol !== tokenBridgeDestination.symbol) {
          try {
            const res2 = await apiService.getQuote(destinationChain.chainId, {
              fromTokenAddress: tokenBridgeDestination.address,
              toTokenAddress: toToken.address,
              amount: res1.toTokenAmount
            })
            const estimatedGasRes2 = await calculateGasPriceInUsd(destinationChain.chainId, res2.estimatedGas)
            txCostValue = txCostValue + estimatedGasRes2
            txCostState = 'done'
            setTxCost({ value: txCostValue, state: txCostState })

            setTokenBridgeAmount(res1.toTokenAmount)
            setToTokenAmount(formatDecimals(formatUnits(res2.toTokenAmount, res2.toToken.decimals)))
          } catch (err: any) {
            setNotification({ title: 'getQuote', description: err.data?.reason ?? err.data?.description ?? null, type: 'error' })
            setToTokenAmount('')
            console.log(err)
            return;
          }
        } else {
          txCostState = 'done'
          setTxCost({ value: txCostValue, state: txCostState })
          setTokenBridgeAmount(res1.toTokenAmount)
          setToTokenAmount(formatDecimals(formatUnits(res1.toTokenAmount, res1.toToken.decimals)))
        }
      } catch (err: any) {
        setNotification({ title: 'getQuote', description: err.data?.reason ?? err.data?.description ?? null, type: 'error' })
        setToTokenAmount('')
        console.log(err)
        return;
      }

    } else {
      if (toToken.symbol !== tokenBridgeDestination.symbol) {
        try {
          const res = await apiService.getQuote(destinationChain.chainId, {
            fromTokenAddress: tokenBridgeDestination.address,
            toTokenAddress: toToken.address,
            amount: parseUnits(fromTokenAmount, fromToken.decimals).toString()
          })
          const estimatedGasRes = await calculateGasPriceInUsd(destinationChain.chainId, res.estimatedGas)
          txCostValue = txCostValue + estimatedGasRes
          txCostState = 'done'
          setTxCost({ value: txCostValue, state: txCostState })

          setTokenBridgeAmount(res.toTokenAmount)
          setToTokenAmount(formatDecimals(formatUnits(res.toTokenAmount, res.toToken.decimals)))
        } catch (err: any) {
          setNotification({ title: 'getQuote', description: err.data?.reason ?? err.data?.description ?? null, type: 'error' })
          setToTokenAmount('')
          console.log(err)
          return;
        }
      } else {
        txCostState = 'done'
        setTxCost({ value: txCostValue, state: txCostState })
        setTokenBridgeAmount(parseUnits(fromTokenAmount, fromToken.decimals).toString())
        setToTokenAmount(formatDecimals(fromTokenAmount))
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
    transerFee
  ]);
  // fetch fromToken balance
  useEffect(() => {
    if (!fromToken) return;
    fetchTokenBalance(fromToken).then(res => setFromTokenBalance(res?.value.toString() ?? '0'))
  }, [fetchTokenBalance, fromToken])

  // fetch tokenBridge balance and calculate if sufficient for pay transfer fee
  useEffect(() => {
    if (!tokenBridgeAmount || !fromToken) return;

    fetchTokenBalance(tokenBridgeSource).then((res) => {
      const balanceTokenBridgeAfterSwap = res?.value.add(tokenBridgeAmount);
      const tokenBridgeAmountPlusFee = BigNumber.from(tokenBridgeAmount).add(transerFee.inTokenBridge);
      setInsufficientTokenBridge(balanceTokenBridgeAfterSwap?.lt(tokenBridgeAmountPlusFee))
    });
  }, [transerFee, tokenBridgeSource])

  const insufficientBalance = useMemo(() => {
    if (fromTokenAmount === '' || !fromToken) return true;
    const fromTokenAmountParsed = parseUnits(fromTokenAmount, fromToken.decimals)

    if (insufficientTokenBridge) {
      const fromTokenAmountRequired = fromTokenAmountParsed.add(transerFee.inFromToken)
      return fromTokenAmountRequired.gt(fromTokenBalance);
    } else {
      return fromTokenAmountParsed.gt(fromTokenBalance)
    }

  }, [fromTokenAmount, fromTokenBalance, insufficientTokenBridge])

  useEffect(() => {
    getQuote()
    const interval = setInterval(async () => await getQuote(), 8000)
    return () => {
      clearInterval(interval)
    }
  }, [getQuote])

  // fetch transfer fee and calculate it in fromToken
  useEffect(() => {
    if (!tokenBridgeAmount || !fromToken || !fromTokenAmount || isLoadingSwitchNetwork) return;
    axelarQuery.getTransferFee(
      sourceChain.name,
      destinationChain.name,
      'uusdc',
      parseFloat(formatUnits(tokenBridgeAmount, tokenBridgeSource.decimals))
    ).then(({ fee }) => {
      if (fee) {
        const ratio = parseFloat(fromTokenAmount) / parseFloat(formatUnits(tokenBridgeAmount, tokenBridgeSource.decimals));
        const feeAmountFormated = parseFloat(formatUnits(fee.amount, tokenBridgeSource.decimals))
        const transferFeeInFromToken = (ratio * feeAmountFormated).toString();
        setTransferFee({
          inTokenBridge: fee.amount,
          inFromToken: parseUnits(transferFeeInFromToken, fromToken.decimals).toString(),
          inUsd: feeAmountFormated.toFixed(),
        });
      }
    });
  }, [fromToken, tokenBridgeAmount, sourceChain, destinationChain, tokenBridgeSource, isLoadingSwitchNetwork]);

  // getprices
  // useEffect(() => {
  //   if (!destinationChain) return;
  //   const tokens = baseTokens[destinationChain.name.toLowerCase()]
  //   apiService.getTokensPrice().then((tokensPrices) => {

  //     for (const token of tokens) {
  //       const priceToken = tokensPrices[token.address]
  //       if (priceToken) {
  //         const parsedPrice = formatUnits(priceToken, token.decimals)
  //         console.log(parsedPrice, token.symbol, token.decimals)
  //       }
  //     }

  //   })
  // }, [destinationChain])

  const readySwap = useMemo(() => {
    return !!(fromToken && toToken && address && fromTokenAmount && toTokenAmount && sourceChain !== destinationChain && !insufficientBalance)
  }, [
    fromToken,
    toToken,
    fromTokenAmount,
    address,
    toTokenAmount,
    sourceChain,
    destinationChain,
    insufficientBalance
  ])

  const needApproveforSwap = useCallback(async (chainId: number, token: BaseToken, amount: string) => {
    if (token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') return false;
    const parsedAmount = parseUnits(amount, token.decimals).toNumber();
    const { allowance } = await apiService.getAllowance(chainId, { tokenAddress: token.address, address: address as string })
    return parsedAmount > allowance;

  }, [address, apiService]);

  const getApproveCallData = async (chainId: number, token: BaseToken, amount: string) => {
    let parsedAmount: string;
    if (maxApproveAmount) {
      parsedAmount = constants.MaxUint256.toString()
    } else {
      parsedAmount = parseUnits(amount, token.decimals).toString();
    }

    return await apiService.getApproveCallData(chainId, { tokenAddress: token.address, amount: parsedAmount })
  };

  const getSwapCallData = async (chainId: number, fromToken: BaseToken, toToken: BaseToken, amount: string, fromAddress: string, slippage: string) => {
    return await apiService.getSwapCallData(chainId, {
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount: amount,
      fromAddress,
      slippage
    });
  };

  const swapBeforeBridge = useCallback(async () => {
    if (!sourceChain || !fromToken || !address) throw new Error<{ reason: string }>({ reason: 'missin params', statusCode: 1 });
    let currentStep = `swap before bridge: ${fromToken.symbol} to ${tokenBridgeSource.symbol}`
    try {
      if (fromToken.symbol !== tokenBridgeSource.symbol) {
        const needApprove = await needApproveforSwap(sourceChain.chainId, fromToken, fromTokenAmount);
        if (needApprove) {
          const approveCallData = await getApproveCallData(sourceChain.chainId, fromToken, fromTokenAmount);
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
        let fromTokenAmountParsed = parseUnits(fromTokenAmount, fromToken.decimals);
        if (insufficientTokenBridge) {
          fromTokenAmountParsed = fromTokenAmountParsed.add(transerFee.inFromToken);
        }
        console.log('fromTokenAmountParsed out if', fromTokenAmountParsed.toString())

        const swapCallData = await getSwapCallData(sourceChain.chainId, fromToken, tokenBridgeSource, fromTokenAmountParsed.toString(), address as string, slippage);

        const config = await prepareSendTransaction({
          request: {
            data: swapCallData.tx.data,
            from: swapCallData.tx.from,
            gasLimit: swapCallData.tx.gas,
            gasPrice: swapCallData.tx.gasPrice,
            to: swapCallData.tx.to,
            value: swapCallData.tx.value
          }
        })
        currentStep = `swap before bridge: ${fromToken.symbol} to ${tokenBridgeSource.symbol}`
        const tx = await sendTransaction(config);
        await tx.wait()
        console.log('swap hash', tx.hash)
      }
    } catch (err: any) {
      throw new Error<TransactionError>({ step: 'swapBeforeBridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });
    }

  }, [sourceChain, fromToken, fromTokenAmount, address, slippage, tokenBridgeSource, transerFee])

  const swapAfterBridge = useCallback(async () => {
    if (!sourceChain || !tokenBridgeAmount || !address || !toToken || !destinationChain || !switchNetworkAsync) throw new Error<{ reason: string }>({ reason: 'missing params', statusCode: 1 });
    let currentStep = `swap after bridge: ${tokenBridgeDestination.symbol} to ${toToken.symbol}`
    let currentChainId = sourceChain.chainId;
    try {
      if (toToken.symbol !== tokenBridgeDestination.symbol) {
        try {
          currentChainId = (await switchNetworkAsync(destinationChain.chainId)).id
        } catch (err: any) {
          throw new Error<TransactionError>({ step: 'swapAfterBridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? 'switchNetwork', statusCode: 1 });
        }
        const needApprove = await needApproveforSwap(currentChainId, tokenBridgeDestination, tokenBridgeAmount);
        if (needApprove) {
          const approveCallData = await getApproveCallData(currentChainId, tokenBridgeDestination, tokenBridgeAmount);
          const config = await prepareSendTransaction({
            request: {
              to: approveCallData.to,
              data: approveCallData.data,
              value: approveCallData.value,
            }
          })
          currentStep = `approve ${tokenBridgeDestination.symbol} for swap`;
          const tx = await sendTransaction(config);
          await tx.wait()
          console.log('approve hash', tx.hash)
        }

        const swapCallData = await getSwapCallData(currentChainId, tokenBridgeDestination, toToken, tokenBridgeAmount, address as string, slippage)
        const config = await prepareSendTransaction({
          request: {
            data: swapCallData.tx.data,
            from: swapCallData.tx.from,
            gasLimit: swapCallData.tx.gas,
            gasPrice: swapCallData.tx.gasPrice,
            to: swapCallData.tx.to,
            value: swapCallData.tx.value
          }
        })
        currentStep = `swap after bridge: ${tokenBridgeDestination.symbol} to ${toToken.symbol}`
        const tx = await sendTransaction(config);
        await tx.wait()
        console.log('swap swapBeforeBrigde hash', tx.hash)
      }
    } catch (err: any) {
      throw new Error<TransactionError>({ step: 'swapAfterBridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });

    }

  }, [sourceChain, destinationChain, tokenBridgeAmount, address, toToken, slippage])

  const bridge = useCallback(async () => {
    if (!fromToken) return;
    let currentStep = 'bridge';
    const assetDenom = 'uusdc';
    try {
      const axelarAssetTransfer = new AxelarAssetTransfer({
        environment: Environment.MAINNET,
      });

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
          BigNumber.from(tokenBridgeAmount).add(transerFee.inTokenBridge),
        ],
      });

      const txBridge = await writeContract(configTransfer);
      await txBridge.wait()
      console.log('bridge bridge hash', txBridge.hash)
    } catch (err: any) {
      throw new Error<TransactionError>({ step: 'bridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });
    }
  }, [sourceChain, destinationChain, tokenBridgeSource, tokenBridgeAmount, address])


  // const bridge = useCallback(async () => {
  //   let currentStep = 'bridge';
  //   try {
  //     const allowance = (await readContract({
  //       address: tokenBridgeSource.address,
  //       abi: ERC20.abi,
  //       functionName: 'allowance',
  //       args: [address, sourceChain.gateway]
  //     })) as BigNumber

  //     if (allowance.lt(tokenBridgeAmount)) {
  //       const configApproveGateway = await prepareWriteContract({
  //         address: tokenBridgeSource.address,
  //         abi: ERC20.abi,
  //         functionName: 'approve',
  //         args: [
  //           sourceChain.gateway,
  //           tokenBridgeAmount,
  //         ],
  //       });
  //       currentStep = 'approve gateway contract'
  //       const txApprove = await writeContract(configApproveGateway);
  //       await txApprove.wait()
  //       console.log('approve gateway hash', txApprove.hash)
  //     }

  //     const configCallGateway = await prepareWriteContract({
  //       address: sourceChain.gateway,
  //       abi: AxelarGateway.abi,
  //       functionName: 'sendToken',
  //       args: [
  //         destinationChain.name,
  //         address,
  //         tokenBridgeSource.symbol,
  //         tokenBridgeAmount
  //       ]
  //     })
  //     currentStep = 'send token from gateway contract'
  //     const txBridge = await writeContract(configCallGateway);
  //     await txBridge.wait()
  //     console.log('bridge bridge hash', txBridge.hash)
  //   } catch (err: any) {
  //     throw new Error<TransactionError>({ step: 'bridge', reason: err.data?.reason ?? err.data?.description ?? err.message ?? currentStep, statusCode: 1 });
  //   }
  // }, [sourceChain, destinationChain, tokenBridgeSource, tokenBridgeAmount, address])

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
    }}>
      {children}
    </SwapContext.Provider>
  );
};

const useSwap = () => useContext(SwapContext)!;

export { SwapProvider, useSwap };
