import { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface Props {
  children: ReactNode;
  onClose?: () => void;
}
export default function Modal({ children, onClose }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="flex bg-slate-800 h-[28rem] w-96 sm:w-[26rem] rounded-2xl shadow-xl">
        <div className="relative w-full">
        { onClose && 
            <FiX
              className="absolute right-5 top-5 h-5 w-5"
              onClick={onClose}
            />}
          {children}
        </div>
      </div>
    </div>
  );
}