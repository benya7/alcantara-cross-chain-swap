import { useDisconnect, useEnsAvatar } from "wagmi";

interface Props {
  address?: `0x${string}`;
}

export default function Profile({ address }: Props) {
  const { disconnect } = useDisconnect();
  const { data } = useEnsAvatar({ address });

  return (
    <div className='flex flex-col justify-center p-5 h-full'>
      <div className='flex-none'>
        <p>Profile</p>
        <div className='flex justify-between items-center'>
          <div className='flex gap-1'>
            <p>Working...</p>
            <div>
              <p>very soon</p>
            </div>
          </div>
          <button
            className='bg-red-600 border-slate-900 border rounded-lg py-2 px-3 text-sm hover:bg-red-500 delay-100'
            onClick={() => disconnect()}
          >
            Log Out
          </button>
        </div>

      </div>
      <p>Recent Transactions</p>
      <div className='border rounded-2xl p-4 flex-1'>
        <p>Working...</p>
      </div>
    </div>
  )
}