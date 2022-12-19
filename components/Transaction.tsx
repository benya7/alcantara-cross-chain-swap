import { useMemo } from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { AxelarChain } from "../config/chains";
import { BaseToken } from "../config/tokens"
import { Steps, TxHashUrl } from "../contexts/Swap";
import Spinner from "./Layout/Spinner";
import ViewInExplorerButton from "./ViewInExplorerButton";

interface Props {
  fromToken?: BaseToken;
  toToken?: BaseToken;
  tokenBridgeSource: BaseToken;
  tokenBridgeDestination: BaseToken;
  sourceChain: AxelarChain;
  destinationChain: AxelarChain;
  steps: Steps;
  txHashUrl: TxHashUrl;
  openModalTransaction: boolean;
  onCloseModalTransaction: () => void;
}
export default function Transaction({
  fromToken,
  toToken,
  tokenBridgeSource,
  tokenBridgeDestination,
  sourceChain,
  destinationChain,
  steps,
  txHashUrl,
  openModalTransaction,
  onCloseModalTransaction
}: Props) {

  const fromTokenMemo = useMemo(() => {
    if (!openModalTransaction) return undefined;
    return fromToken;
  }, [openModalTransaction])
  const toTokenMemo = useMemo(() => {
    if (!openModalTransaction) return undefined;
    return toToken;
  }, [openModalTransaction])
  const tokenBridgeSourceMemo = useMemo(() => {
    if (!openModalTransaction) return undefined;
    return tokenBridgeSource;
  }, [openModalTransaction])
  const tokenBridgeDestinationMemo = useMemo(() => {
    if (!openModalTransaction) return undefined;
    return tokenBridgeDestination;
  }, [openModalTransaction])
  const sourceChainMemo = useMemo(() => {
    if (!openModalTransaction) return undefined;
    return sourceChain;
  }, [openModalTransaction])
  const destinationChainMemo = useMemo(() => {
    if (!openModalTransaction) return undefined;
    return destinationChain;
  }, [openModalTransaction])


  return (
    <div className="px-2 py-4 w-full space-y-2 h-full overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-slate-700">
      <p className="text-xl font-semibold text-center">Transaction</p>
      <div className="bg-slate-800 rounded-2xl px-4 py-2 h-fit gap-2 flex flex-col justify-between">
        <div className="space-y-2 flex flex-col justify-center">
          {fromTokenMemo?.symbol !== tokenBridgeSourceMemo?.symbol && (
            <div className="border rounded-xl py-3">
              <div className="inline-flex gap-2 justify-center w-full">
                <p>Swap</p>
                <span className="flex gap-1 items-center font-semibold">
                  <img src={fromTokenMemo?.logoURI} className='h-5 w-5' alt="" />
                  {fromTokenMemo?.symbol}
                </span>
                <p>to</p>
                <span className="flex gap-1 items-center font-semibold">
                  <img src={tokenBridgeSourceMemo?.logoURI} className='h-5 w-5' alt="" />
                  {tokenBridgeSourceMemo?.symbol}
                </span>
              </div>
              {steps['swapBeforeBridge'].state === 'loading' && <Spinner className="animate-spin mt-2 m-auto h-5 w-5 text-white" />}
              {steps['swapBeforeBridge'].state === 'completed' && <HiOutlineCheckCircle className="m-auto mt-2 h-6 w-6 text-green-600" />}
              {steps['swapBeforeBridge'].state === 'failed' && <HiOutlineXCircle className="m-auto mt-2 h-6 w-6 text-red-600" />}
              {txHashUrl.swapBeforeBridge !== '' && <ViewInExplorerButton url={txHashUrl.swapBeforeBridge} />}
            </div>
          )}
          <div className="border rounded-xl py-3">
            <div className="inline-flex flex-wrap gap-2 justify-center w-full">
              <p>Send</p>
              <span className="flex gap-1 items-center font-semibold">
                <img src={tokenBridgeDestinationMemo?.logoURI} className='h-5 w-5' alt="" />
                {tokenBridgeDestinationMemo?.symbol}
              </span>
              <p>from</p>
              <span className="flex gap-1 items-center font-semibold">
                <img src={sourceChainMemo?.image} className='h-5 w-5' alt="" />
                {sourceChainMemo?.name}
              </span>
              <p>to</p>
              <span className="flex gap-1 items-center font-semibold">
                <img src={destinationChainMemo?.image} className='h-5 w-5' alt="" />
                {destinationChainMemo?.name}
              </span>
            </div>
            {(!(steps['swapBeforeBridge'].state === 'failed') && steps['bridge'].state === 'loading') && <Spinner className="animate-spin mt-2 m-auto h-5 w-5 text-white" />}
            {steps['bridge'].state === 'completed' && <HiOutlineCheckCircle className="m-auto mt-2 h-6 w-6 text-green-600" />}
            {(steps['swapBeforeBridge'].state === 'failed' || steps['bridge'].state === 'failed') && <HiOutlineXCircle className="m-auto mt-2 h-6 w-6 text-red-600" />}
            {txHashUrl.bridge !== '' && <ViewInExplorerButton url={txHashUrl.bridge} />}
          </div>
          {toTokenMemo?.symbol !== tokenBridgeDestinationMemo?.symbol && (
            <div className="border rounded-xl py-3">
              <div className="inline-flex gap-2 justify-center w-full">
                <p>Swap</p>
                <span className="flex gap-1 items-center font-semibold">
                  <img src={tokenBridgeDestinationMemo?.logoURI} className='h-5 w-5' alt="" />
                  {tokenBridgeDestinationMemo?.symbol}
                </span>
                <p>to</p>
                <span className="flex gap-1 items-center font-semibold">
                  <img src={toToken?.logoURI} className='h-5 w-5' alt="" />
                  {toToken?.symbol}
                </span>
              </div>
              {!(steps['swapBeforeBridge'].state === 'failed') && (!(steps['bridge'].state === 'failed') && steps['swapAfterBridge'].state === 'loading') && <Spinner className="animate-spin mt-2 m-auto h-5 w-5 text-white" />}
              {steps['swapAfterBridge'].state === 'completed' && <HiOutlineCheckCircle className="m-auto mt-2 h-6 w-6 text-green-600" />}
              {(steps['swapBeforeBridge'].state === 'failed' || steps['bridge'].state === 'failed' || steps['swapAfterBridge'].state === 'failed') && <HiOutlineXCircle className="m-auto mt-2 h-6 w-6 text-red-600" />}
              {txHashUrl.swapAfterBridge !== '' && <ViewInExplorerButton url={txHashUrl.swapAfterBridge} />}
            </div>
          )}
        </div>
        {(steps['swapBeforeBridge'].state === 'failed' ||
          steps['bridge'].state === 'failed' ||
          steps['swapAfterBridge'].state === 'failed' ||
          steps['swapAfterBridge'].state === 'completed') &&
          <button className="bg-blue-600 w-full hover:bg-blue-500 delay-100 rounded-xl py-2 text-xl" onClick={onCloseModalTransaction}>Close</button>
        }
      </div>
    </div>
  )
}
