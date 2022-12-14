import React, { RefObject } from 'react'
import { ChainOption } from '../contexts/Swap'
import Select, { ActionMeta, SelectInstance, SingleValue } from 'react-select'

interface Props {
  label: string;
  options: ChainOption[];
  chainRef: RefObject<SelectInstance<ChainOption>>;
  onChangeChain: (newValue: SingleValue<ChainOption>, actionMeta: ActionMeta<ChainOption>) => void;
}

export default function NetworkSwitcher({
  label,
  options,
  chainRef,
  onChangeChain,
}: Props) {
  return (
    <div className="flex-1">
      <p className="text-sm font-semibold mb-0.5 ml-1">{label}</p>
      <Select<ChainOption>
        options={options}
        ref={chainRef}
        onChange={onChangeChain}
        isSearchable={false}
        formatOptionLabel={(option) => (
          <div className="flex gap-1 items-center">
            <img src={option.image} className="h-5 w-5" alt="" />
            <p className='ml-1'>{option.label}</p>
          </div>
        )}
        styles={{
          control: (baseStyle) => ({
            ...baseStyle,
            borderRadius: '12px',
            backgroundColor: 'transparent',
            ':hover': {
              cursor: 'pointer'
            }
          }),
          singleValue: (baseStyle) => ({
            ...baseStyle,
            color: '#f8fafc'
          }),
          indicatorSeparator: () => ({
            display: 'none'
          }),
          menu: (baseStyle) => ({
            ...baseStyle,
            backgroundColor: '#475569',
            marginTop: '4px'
          }),
          option: (baseStyle, state) => ({
            ...baseStyle,
            backgroundColor: state.isSelected ? '#0284c7' : 'transparent',
            ':hover': {
              backgroundColor: '#334155',
            }
          }),
          valueContainer: (baseStyle) => ({
            ...baseStyle,
            padding: '2px 2px 2px 10px'
          })
        }}
      />
    </div>
  )
}
