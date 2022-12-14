import { BaseToken } from "../config/tokens"

interface Props {
  option: BaseToken;
}

export default function TokenOption({ option }: Props) {
  return (
    <div className="flex gap-2 items-center px-3 py-1 hover:bg-slate-200 delay-100">
      <img src={option.logoURI} className="h-8 w-8" alt="" />
      <div>
        <p className="text-slate-900">{option.name}</p>
        <p className="text-slate-600 text-sm">{option.symbol}</p>
      </div>
    </div>
  )
}
