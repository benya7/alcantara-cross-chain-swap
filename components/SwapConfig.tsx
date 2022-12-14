import { useSwap } from "../contexts/Swap"

export default function SwapConfig() {

  const {
    slippage,
    onChangeSlippage,
    allowPartialFill,
    onCheckedAllowPartialFill,
    maxApproveAmount,
    onChangeMaxApproveAmount
  } = useSwap();

  return (
    <div className='p-6'>
      <p className="font-semibold text-xl">Advanced Params</p>
      <div className="flex flex-col p-4 gap-2">
        <div className="flex items-center justify-between">
          <p>slippage:</p>
          <input type="text" value={slippage} onChange={onChangeSlippage} className="w-20 p-1 bg-transparent focus:ring-0 rounded focus:border-slate-50" />
        </div>
        <div className="flex items-center justify-between">
          <p>allow partial fill:</p>
          <input type="checkbox" checked={allowPartialFill} onChange={onCheckedAllowPartialFill} className="" />
        </div>
        <div className="flex items-center justify-between">
          <p>max approve amount:</p>
          <input type="checkbox" checked={maxApproveAmount} onChange={onChangeMaxApproveAmount} className="" />
        </div>
      </div>
    </div>
  )
}
