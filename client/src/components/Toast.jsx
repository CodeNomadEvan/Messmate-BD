import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
const ToastContext = createContext({ toast: () => { } });
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const toast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);
    const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    return (<ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (<ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)}/>))}
      </div>
    </ToastContext.Provider>);
}
function ToastCard({ toast, onDismiss }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);
    const styles = {
        success: { bg: 'bg-[#1A6B3C]', icon: <CheckCircle2 size={16} className="text-white"/> },
        error: { bg: 'bg-[#DC2626]', icon: <XCircle size={16} className="text-white"/> },
        warning: { bg: 'bg-[#D97706]', icon: <AlertCircle size={16} className="text-white"/> },
    }[toast.type];
    return (<div style={{ transition: 'all 0.2s ease', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }} className={`pointer-events-auto flex items-center gap-2.5 ${styles.bg} text-white px-4 py-3 rounded-[10px] shadow-lg max-w-xs`}>
      {styles.icon}
      <span className="text-sm font-display font-600">{toast.message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-70 hover:opacity-100"><X size={14}/></button>
    </div>);
}
export function useToast() {
    return useContext(ToastContext);
}
