import { chainsDetailsData } from "../config/chains"
import { useSwap } from "../contexts/Swap";
import Select, { createFilter } from 'react-select'
import { HiOutlineArrowCircleRight } from "react-icons/hi";
import { BaseToken } from "../config/tokens";
import Modal from "./Layout/Modal";
import TokenOption from "./TokenOption";
import TokenCard from "./TokenCard";
import NetworkSwitcher from "./NetworkSwitcher";
import ActionButton from "./ActionButton";
import formatDecimals from "../utils/formatDecimals";
import Transaction from "./Transaction";

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
    destinationChain,
    txHashUrl
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
        actionText='You buy'
        token={fromToken}
        openModal={openModalFromToken}
        onChangeTokenAmount={onChangeFromTokenAmount}
        tokenAmount={fromTokenAmount.formated}
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
        actionText='You sell'
        token={toToken}
        openModal={openModalToToken}
        readOnly={true}
        primary
        tokenAmount={formatDecimals(toTokenAmount.formated)}
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
          <Transaction
            fromToken={fromToken}
            toToken={toToken}
            tokenBridgeSource={tokenBridgeSource}
            tokenBridgeDestination={tokenBridgeDestination}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            steps={steps}
            txHashUrl={txHashUrl}
            openModalTransaction={openModalTransaction}
            onCloseModalTransaction={onCloseModalTransaction}
          />
        </Modal>
      )
    }
  </>
  )
}
