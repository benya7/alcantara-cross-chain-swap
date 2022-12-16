import { chainsDetailsData } from "../config/chains"
import { useSwap } from "../contexts/Swap";
import Select, { createFilter, components } from 'react-select'
import { HiOutlineArrowCircleRight, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { BaseToken } from "../config/tokens";
import Modal from "./Layout/Modal";
import TokenOption from "./TokenOption";
import TokenCard from "./TokenCard";
import NetworkSwitcher from "./NetworkSwitcher";
import ActionButton from "./ActionButton";
import Spinner from "./Layout/Spinner";

const options = Object.values(chainsDetailsData).map((x) => {
  return { label: x.name, value: x.chainId, image: x.image }
});

const styleTokenSelect = {
  option: () => ({}),
  indicatorSeparator: () => ({}),
  menu: (base: any) => ({
    ...base,
    marginTop: '4px',
    zIndex: 30,
    '::-webkit-scrollbar': {
      width: '4px',
    }
  }),
  indicatorsContainer: () => ({
    display: 'none'
  }),
  menuList: (base: any) => ({
    ...base,
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-track': {
      background: ' #f1f1f1'
    },
    '::-webkit-scrollbar-thumb': {
      background: '#888'
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#555'
    },
  })
}

const filtersTokenSelect = createFilter<BaseToken>(
  {
    ignoreCase: true,
    ignoreAccents: true,
    matchFrom: 'any',
    stringify: (option) => `${option.data.symbol} ${option.data.address} ${option.data.name}`,
    trim: true,
  }
)

export default function Swap() {
  const {
    fromToken,
    toToken,
    tokenBridgeSource,
    tokenBridgeDestination,
    onChangeSourceChain,
    onChangeDestinationChain,
    fromTokensList,
    toTokensList,
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
    bridgeAndSwap,
    readySwap,
    steps,
    sourceChain,
    destinationChain
  } = useSwap();


  return (<>
    <div className="flex justify-around items-center">
      <NetworkSwitcher
        label='Source'
        options={options}
        chainRef={sourceChainsRef}
        onChangeChain={onChangeSourceChain}
      />
      <HiOutlineArrowCircleRight className="h-6 w-6 self-end mb-2 mx-2 flex-none" />
      <NetworkSwitcher
        label='Destination'
        options={options}
        chainRef={destinationChainsRef}
        onChangeChain={onChangeDestinationChain}
      />
    </div>
    <div className="flex flex-col py-2 gap-3">
      <TokenCard
        showModal={showModalFromToken}
        token={fromToken}
        openModal={openModalFromToken}
        onChangeTokenAmount={onChangeFromTokenAmount}
        tokenAmount={fromTokenAmount}
      >
        <Modal>
          <div className="flex flex-col gap-2 py-4 px-6">
            <p className="text-xl font-semibold mx-auto">Select a token</p>
            <Select<BaseToken>
              ref={fromTokenRef}
              menuIsOpen
              isSearchable
              options={fromTokensList.current}
              onChange={onChangeFromToken}
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              isClearable={false}
              placeholder='Search by name, symbol or paste address'
              tabSelectsValue={false}
              formatOptionLabel={(option) => <TokenOption option={option} />}
              filterOption={filtersTokenSelect}
              styles={styleTokenSelect}
              onMenuScrollToBottom={incrementPageFromTokensList}
            />
          </div>
        </Modal>
      </TokenCard>
      <TokenCard
        showModal={showModalToToken}
        token={toToken}
        openModal={openModalToToken}
        readOnly={true}
        primary
        tokenAmount={toTokenAmount}
      >
        <Modal>
          <div className="flex flex-col gap-2 py-4 px-6">
            <p className="text-xl font-semibold mx-auto">Select a token</p>
            <Select<BaseToken>
              ref={toTokenRef}
              menuIsOpen
              isSearchable
              options={toTokensList.current}
              onChange={onChangeToToken}
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              isClearable={false}
              placeholder='Search by name, symbol or paste address'
              tabSelectsValue={false}
              formatOptionLabel={(option) => <TokenOption option={option} />}
              filterOption={filtersTokenSelect}
              styles={styleTokenSelect}
              onMenuScrollToBottom={incrementPageToTokensList}
            />
          </div>
        </Modal>
      </TokenCard>
    </div>
    <ActionButton
      disabled={!readySwap}
      onClick={bridgeAndSwap}
    />
    {
      openModalTransaction && (
        <Modal>
          <div className="gap-1 p-2 w-full h-full flex flex-col">
            <p className="text-xl font-semibold m-auto">Transaction</p>
            <div className="bg-slate-800 rounded-2xl p-4 flex-1 space-y-2">
              <div className="border rounded-xl py-3">
                <div className="inline-flex gap-2 justify-center w-full">
                  <p>Swap</p>
                  <span className="flex gap-1 items-center font-semibold">
                    <img src={fromToken?.logoURI} className='h-5 w-5' alt="" />
                    {fromToken?.symbol}
                  </span>
                  <p>to</p>
                  <span className="flex gap-1 items-center font-semibold">
                    <img src={tokenBridgeSource.logoURI} className='h-5 w-5' alt="" />
                    {tokenBridgeSource.symbol}
                  </span>
                </div>
                {steps['swapBeforeBridge'].state === 'loading' && <Spinner className="animate-spin mt-2 m-auto h-5 w-5 text-white" />}
                {steps['swapBeforeBridge'].state === 'completed' && <HiOutlineCheckCircle className="m-auto mt-2 h-6 w-6 text-green-600" />}
                {steps['swapBeforeBridge'].state === 'failed' && <HiOutlineXCircle className="m-auto mt-2 h-6 w-6 text-red-600" />}
              </div>
              <div className="border rounded-xl py-3">
                <div className="inline-flex flex-wrap gap-2 justify-center w-full">
                  <p>Send</p>
                  <span className="flex gap-1 items-center font-semibold">
                    <img src={tokenBridgeDestination.logoURI} className='h-5 w-5' alt="" />
                    {tokenBridgeDestination.symbol}
                  </span>
                  <p>from</p>
                  <span className="flex gap-1 items-center font-semibold">
                    <img src={sourceChain.image} className='h-5 w-5' alt="" />
                    {sourceChain.name}
                  </span>
                  <p>to</p>
                  <span className="flex gap-1 items-center font-semibold">
                    <img src={destinationChain.image} className='h-5 w-5' alt="" />
                    {destinationChain.name}
                  </span>
                </div>
                {(!(steps['swapBeforeBridge'].state === 'failed') && steps['bridge'].state === 'loading') && <Spinner className="animate-spin mt-2 m-auto h-5 w-5 text-white" />}
                {steps['bridge'].state === 'completed' && <HiOutlineCheckCircle className="m-auto mt-2 h-6 w-6 text-green-600" />}
                {(steps['swapBeforeBridge'].state === 'failed' || steps['bridge'].state === 'failed') && <HiOutlineXCircle className="m-auto mt-2 h-6 w-6 text-red-600" />}
              </div>
              <div className="border rounded-xl py-3">
                <div className="inline-flex gap-2 justify-center w-full">
                  <p>Swap</p>
                  <span className="flex gap-1 items-center font-semibold">
                    <img src={tokenBridgeDestination.logoURI} className='h-5 w-5' alt="" />
                    {tokenBridgeDestination.symbol}
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
              </div>
              {(steps['swapBeforeBridge'].state === 'failed' ||
                steps['bridge'].state === 'failed' ||
                steps['swapAfterBridge'].state === 'failed' ||
                steps['swapAfterBridge'].state === 'completed') &&
                <button className="bg-blue-700 w-full hover:bg-blue-600 delay-100 rounded-xl py-2 text-xl" onClick={onCloseModalTransaction}>Close</button>
              }
            </div>
          </div>
        </Modal>
      )
    }
  </>
  )
}
