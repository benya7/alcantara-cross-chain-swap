import { useAccount, useConnect } from "wagmi"
import { Connect } from "./Connect"

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export default function ActionButton({ disabled, onClick }: Props) {
  const { isConnected } = useAccount()
  if (!isConnected) {
    return <Connect className="bg-blue-600 hover:bg-blue-500 delay-100 w-full rounded-xl py-1 text-xl" />
  } else {
    return (
      <button className="bg-blue-700 w-full rounded-xl py-2 text-xl hover:bg-blue-600 delay-100 hover:cursor-pointer disabled:bg-slate-400 hover:disabled:cursor-default" onClick={onClick} disabled={disabled}>Swap</button>
    )
  }
  
}
