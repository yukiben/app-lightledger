
import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onNumber: (num: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ onNumber, onDelete, onClear }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onNumber(key)}
          className="h-12 flex items-center justify-center text-xl font-light hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-all"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="h-12 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-all"
      >
        <Delete size={18} className="text-slate-300" />
      </button>
    </div>
  );
};

export default Keypad;
