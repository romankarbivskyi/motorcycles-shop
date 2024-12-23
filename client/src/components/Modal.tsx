import { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="bg-white min-w-[200px] p-3 border-2 border-black rounded fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="flex justify-between items-center">
        <p className="text-xl, text-black">{title}</p>
        <button
          className="p-2 border rounded bg-gray-300 hover:opacity-65"
          onClick={onClose}
        >
          X
        </button>
      </div>
      {children}
    </div>
  );
}
