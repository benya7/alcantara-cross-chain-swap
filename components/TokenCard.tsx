import React, { ChangeEvent, ReactNode } from 'react'
import { HiChevronDown } from 'react-icons/hi';
import { BaseToken } from '../config/tokens';
import { clsx } from 'clsx';

interface Props {
  showModal: () => void;
  actionText: string;
  token?: BaseToken;
  openModal: boolean;
  children: ReactNode;
  readOnly?: boolean;
  primary?: boolean;
  onChangeTokenAmount?: (e: ChangeEvent<HTMLInputElement>) => void;
  tokenAmount?: string;
}

export default function TokenCard({
  showModal,
  actionText,
  token,
  openModal,
  children,
  readOnly = false,
  primary = false,
  onChangeTokenAmount,
  tokenAmount
}: Props) {

  return (
    <div className={primary ? 'rounded-2xl py-3 px-4 bg-slate-700' : 'rounded-2xl py-3 px-4 border border-slate-700'}>
      <p className='text-xs'>{actionText}</p>
      <div className="flex-1 flex items-center justify-between">
        <button onClick={showModal} className='px-2 py-1 rounded-xl'>
          <div className="flex gap-1 items-center hover:text-white delay-100">
            <img src={token?.logoURI} className="h-6 w-6 mr-1" alt="" />
            <p className="font-semibold">{token?.symbol}</p>
            <HiChevronDown className='' />
          </div>
        </button>
        {readOnly ? (
          tokenAmount && parseFloat(tokenAmount) > 0 ? (
            <input type="text" className="w-24 font-semibold p-0 text-xl text-slate-50 bg-transparent border-none border focus:ring-0 text-end" onChange={onChangeTokenAmount} value={tokenAmount} readOnly={readOnly} />
          ) : (
            <div className='animate-pulse w-24 h-8 bg-slate-500 rounded'></div>
          )
        ) : (
          <input type="text" className="w-24 font-semibold p-1 text-xl text-slate-50 bg-transparent border-none border focus:ring-0 text-end" onChange={onChangeTokenAmount} value={tokenAmount} />
        )}
        {
          openModal &&
          <>
            {children}
          </>
        }
      </div>
      <p className='text-xs'>{token?.name}</p>

    </div>
  )
}
