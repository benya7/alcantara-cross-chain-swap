import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { useModal } from '../hooks/useModal';
import Modal from './Layout/Modal';
import Profile from './Profile';

export function Account() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address })
  const { open, showModal, hideModal } = useModal();

  return (
    <div>
      { address &&  (
        <p className='hover:text-white hover:cursor-pointer' onClick={() => showModal()}>
          { ensName ? ensName : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
        </p>
      )}
      { open && (
        <Modal onClose={hideModal}>
          <Profile address={address} />
        </Modal>
      )}
    </div>
  )
}
