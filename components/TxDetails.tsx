import React from 'react'
import { useSwap } from '../contexts/Swap'
import { TbGasStation } from "react-icons/tb";
export default function TxDetails() {
  const { txCost } = useSwap()
  return (
    <div className='flex justify-between px-2 items-center'>
      <p className='text-sm inline-flex items-center'><TbGasStation className='mr-1' /> Tx cost:</p>
      {
        txCost.state === 'fetching' ?
          (
            <div className='bg-slate-500 rounded animate-pulse w-1/4 h-5'></div>
          ) : (
            <p className='text-sm'>~${txCost.value.toFixed(2)}</p>
          )
      }
    </div>
  )
}
