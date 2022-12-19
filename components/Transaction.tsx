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
    <div className="px-2 py-4 w-full h-full overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-slate-700">
      <p className="text-xl font-semibold text-center">Transaction</p>
      <div className="bg-slate-800 rounded-2xl px-4 py-1 h-5/6 flex flex-col justify-between">
        <div className="space-y-1.5 flex-1 flex flex-col h-full justify-center">
          {fromTokenMemo?.symbol !== tokenBridgeSourceMemo?.symbol && (
            <div className="border rounded-xl py-2 h-28 flex flex-col w-full">
              <div className="flex-none inline-flex gap-2 justify-center">
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
              <div className="flex-1 flex flex-col justify-center">
                {steps['swapBeforeBridge'].state === 'loading' && <Spinner className="animate-spin h-7 w-7 mx-auto text-white" />}
                {steps['swapBeforeBridge'].state === 'completed' && <HiOutlineCheckCircle className="h-6 w-6 mx-auto text-green-600" />}
                {steps['swapBeforeBridge'].state === 'failed' && <HiOutlineXCircle className="h-6 w-6 mx-auto text-red-600" />}
                {txHashUrl.swapBeforeBridge !== '' && <ViewInExplorerButton url={txHashUrl.swapBeforeBridge} />}
              </div>
            </div>
          )}
          <div className="border rounded-xl py-2 h-28 flex flex-col w-full">
            <div className="flex-none inline-flex gap-2 justify-center">
              <p>Send</p>
              <span className="flex gap-1 items-center font-semibold">
                <img src={tokenBridgeDestinationMemo?.logoURI} className='h-5 w-5' alt="" />
                {tokenBridgeDestinationMemo?.symbol}
              </span>
              <p>from</p>
              <span className="flex gap-1 items-center font-semibold">
                <img src={sourceChainMemo?.image} className='h-5 w-5' alt="" />
              </span>
              <p>to</p>
              <span className="flex gap-1 items-center font-semibold">
                <img src={destinationChainMemo?.image} className='h-5 w-5' alt="" />
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {(!(steps['swapBeforeBridge'].state === 'failed') && steps['bridge'].state === 'loading') && <Spinner className="animate-spin mx-auto h-7 w-7 text-white" />}
              {steps['bridge'].state === 'completed' && <HiOutlineCheckCircle className="h-6 w-6 mx-auto text-green-600" />}
              {(steps['swapBeforeBridge'].state === 'failed' || steps['bridge'].state === 'failed') && <HiOutlineXCircle className="h-6 w-6 mx-auto text-red-600" />}
              {txHashUrl.bridge !== '' && <ViewInExplorerButton url={txHashUrl.bridge} />}
            </div>
          </div>
          {toTokenMemo?.symbol !== tokenBridgeDestinationMemo?.symbol && (
            <div className="border rounded-xl py-2 h-28 flex flex-col w-full">
              <div className="flex-none inline-flex gap-2 justify-center">
                <p>Swap</p>
                <span className="flex gap-1 items-center font-semibold">
                  <img src={tokenBridgeDestinationMemo?.logoURI} className='h-5 w-5' alt="" />
                  {tokenBridgeDestinationMemo?.symbol}
                </span>
                <p>to</p>
                <span className="flex gap-1 items-center font-semibold">
                  <img src={toTokenMemo?.logoURI} className='h-5 w-5' alt="" />
                  {toTokenMemo?.symbol}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {!(steps['swapBeforeBridge'].state === 'failed') && (!(steps['bridge'].state === 'failed') && steps['swapAfterBridge'].state === 'loading') && <Spinner className="animate-spin mx-auto h-7 w-7 text-white" />}
                {steps['swapAfterBridge'].state === 'completed' && <HiOutlineCheckCircle className="h-6 w-6 mx-auto text-green-600" />}
                {(steps['swapBeforeBridge'].state === 'failed' || steps['bridge'].state === 'failed' || steps['swapAfterBridge'].state === 'failed') && <HiOutlineXCircle className="h-6 w-6 mx-auto text-red-600" />}
                {txHashUrl.swapAfterBridge !== '' && <ViewInExplorerButton url={txHashUrl.swapAfterBridge} />}
              </div>
            </div>
          )}
        </div>
        {(steps['swapBeforeBridge'].state === 'failed' ||
          steps['bridge'].state === 'failed' ||
          steps['swapAfterBridge'].state === 'failed' ||
          steps['swapAfterBridge'].state === 'completed') &&
          <button className="bg-blue-600 w-full hover:bg-blue-500 delay-100 mt-2 rounded-xl py-2 text-xl flex-none" onClick={onCloseModalTransaction}>Close</button>
        }
      </div>
    </div>
  )
}
