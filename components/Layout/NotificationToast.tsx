import { FiX } from "react-icons/fi";
import { Notification } from "../../contexts/Notification";
interface Props {
  notification: Notification;
  onClose: () => void;
  type: 'error' | 'success';
}
export default function NotificationToast({ notification, onClose, type }: Props) {
  return (
    <div className={`fixed bottom-4 inset-x-0 w-80 mx-auto sm:w-96`}>
      <div 
      className={
        type === 'error' ? 
        'rounded-xl rounded-t border-t-4 border-red-700 bg-red-200 text-red-600 opacity-90 p-6 shadow-lg' : 
        'rounded-xl rounded-t border-t-4 border-green-700 bg-green-200 text-green-600 opacity-90 p-6 shadow-lg'
      }
      >
      <FiX
        className={`absolute right-5 top-5 h-5 w-5`}
        onClick={onClose}
      />
      <p className={
        type === 'error' ?
        'font-semibold text-red-700 underline' :
        'font-semibold text-green-700 underline'
      }
      >{notification.title}</p>
      <p className={
        type === 'error' ?
        'mt-2 truncate text-red-600' :
        'mt-2 truncate text-green-600'
      }
      >{notification.description}</p>
      </div>
    </div>
  );
}
