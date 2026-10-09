import { X } from 'lucide-react';
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[14px] shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display font-800 text-[#1C2B2B] text-base leading-snug">{title}</h3>
          <button onClick={onCancel} className="text-[#A09C94] hover:text-[#6B7878] ml-3"><X size={18}/></button>
        </div>
        <p className="text-sm text-[#6B7878] leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-display font-600 rounded-[8px] bg-[#F7F5F0] border border-[#E3DED6] hover:bg-[#EEF7F2]">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-display font-700 rounded-[8px] text-white ${danger ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#1A6B3C] hover:bg-[#15572F]'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>);
}
