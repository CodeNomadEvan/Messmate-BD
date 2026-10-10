import { X } from 'lucide-react';
import { useEffect } from 'react';
export default function Modal({ title, onClose, children, size = 'md' }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape')
            onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);
    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e => { if (e.target === e.currentTarget)
        onClose(); }}>
      <div className={`bg-white rounded-[14px] shadow-xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2EFE9] sticky top-0 bg-white">
          <h2 className="font-display font-800 text-[#1C2B2B]">{title}</h2>
          <button onClick={onClose} className="text-[#A09C94] hover:text-[#6B7878] p-1 rounded-[6px] hover:bg-[#F7F5F0]">
            <X size={18}/>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>);
}
