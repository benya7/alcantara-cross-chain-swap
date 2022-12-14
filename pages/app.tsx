import { useAccount, useNetwork } from 'wagmi';
import Swap from '../components/Swap';
import { SwapProvider } from '../contexts/Swap';
import { Account } from '../components/Account';
import { Connect } from '../components/Connect';
import { ApiServiceProvider } from '../contexts/ApiService';
import { HiOutlineCog } from 'react-icons/hi';
import { useModal } from '../hooks/useModal';
import Modal from '../components/Layout/Modal';
import SwapConfig from '../components/SwapConfig';
import { useNotification } from '../contexts/Notification';
import NotificationToast from '../components/Layout/NotificationToast';
import TxDetails from '../components/TxDetails';

function Page() {
  const { notification, setNotification } = useNotification();
  const { open, showModal, hideModal } = useModal();

  const handleOnCloseNotification = () => setNotification(undefined);
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  return (
    <ApiServiceProvider>
      <SwapProvider>
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-black text-slate-100'>
          <div className='flex bg-gray-900 shadow-gray-800 border border-slate-800 h-[28rem] w-96 sm:w-[26rem] rounded-2xl shadow'>
            <div className='gap-1 p-2 w-full h-full flex flex-col relative'>
              {isConnected ? (
                <div className='flex items-center justify-between gap-2 px-1'>
                  {chain && <p className='text-sm'><span className='text-[8px] align-middle mr-1 cursor-default'>🟢</span>{chain.name}</p>}
                  <div className='flex items-center gap-2'>
                    <Account />
                    <button onClick={() => showModal()}>
                      <HiOutlineCog className="h-5 w-5 hover:text-slate-900" />
                    </button>
                    {open && (
                      <Modal onClose={hideModal}>
                        <SwapConfig />
                      </Modal>
                    )}
                  </div>
                </div>
              ) : (
                <div className='flex justify-end'>
                  <Connect
                    className='bg-blue-600 rounded-xl py-2 px-3 text-sm hover:bg-blue-500 delay-100'
                  />
                </div>
              )}
              <div className='bg-slate-800 rounded-2xl p-4 flex-1 space-y-1'>
                <Swap />
              </div>
              <div className='flex-1 p-2'>
                <TxDetails />
              </div>
            </div>
          </div>
          <div className="absolute z-30">
            {notification && (
              <NotificationToast notification={notification} onClose={handleOnCloseNotification} type={notification.type} />
            )}
          </div>
        </div>
      </SwapProvider>
    </ApiServiceProvider>
  )
}

export default Page
