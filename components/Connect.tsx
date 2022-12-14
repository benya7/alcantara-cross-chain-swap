import { useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi'
import { useModal } from '../hooks/useModal';
import Modal from './Layout/Modal';

interface Props {
  className: string;
}

export function Connect({ className }: Props) {
  const { isConnected } = useAccount();
  const { connect, connectors, isLoading, pendingConnector } =
    useConnect();
  const { open, showModal, hideModal } = useModal();
  useEffect(() => {
    if (!isConnected) return;
    hideModal()
  }, [isConnected]);

  return (<>
    <button className={className} onClick={() => showModal()}>Connect</button>

    {
      open && (
        <Modal onClose={hideModal}>
          <div className='flex flex-col justify-center px-4 h-full gap-1'>
            {connectors
              .map((x) => (
                <button
                  className='bg-blue-600 border-slate-900 border rounded-lg py-2 text-xl hover:bg-blue-500 delay-100'
                  key={x.id}
                  onClick={() => connect({ connector: x })}
                >
                  {x.name === "Injected" ? "Other" : x.name}
                  {isLoading && x.id === pendingConnector?.id && ' (connecting)'}
                </button>
              ))}
          </div>
        </Modal>
      )
    }
  </>
  )
}
