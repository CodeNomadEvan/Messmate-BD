import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Users, UtensilsCrossed, X } from 'lucide-react'
import Logo from './Logo'
import ConfirmDialog from './ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/members', label: 'Members', icon: Users },
]

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static top-0 left-0 z-30 h-full w-64 bg-white border-r border-[#E3DED6] flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2EFE9]">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <div>
              <p className="font-display font-900 text-[#1C2B2B] text-base leading-tight">MessMate BD</p>
              <p className="text-[10px] text-[#6B7878]">একসাথে থাকি, হিসাবটা সহজ রাখি।</p>
            </div>
          </div>
          <button className="lg:hidden text-[#6B7878]" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <div className="mx-4 my-3 px-3 py-2.5 bg-[#E6F3EC] rounded-[8px]">
          <p className="font-display font-700 text-[#1A6B3C] text-xs">{user?.messName || 'Your mess'}</p>
          <p className="text-[10px] text-[#2D9A5F] mt-0.5">{user?.area || 'Area'} · Code: {user?.messCode || '—'}</p>
        </div>

        <nav className="flex-1 px-3 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-display font-600 mb-0.5 ${isActive ? 'bg-[#1A6B3C] text-white shadow-sm' : 'text-[#6B7878] hover:bg-[#F7F5F0]'}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#F2EFE9] px-4 py-4 relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-full flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center text-sm font-display font-700">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 text-left">
              <p className="text-sm font-display font-700 text-[#1C2B2B]">{user?.name}</p>
              <p className="text-[10px] text-[#1A6B3C] font-display font-700">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={menuOpen ? 'rotate-180' : ''} />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-[#E3DED6] rounded-[10px] shadow-lg py-1">
              <button onClick={() => setSignOutOpen(true)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-display font-600 text-[#DC2626] hover:bg-[#FEE2E2]"><LogOut size={15} /> Sign Out</button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#E3DED6] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-[#6B7878] p-1" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div>
              <p className="text-xs text-[#6B7878] hidden sm:block">{user?.messName} · {user?.area}</p>
              <p className="font-display font-700 text-[#1C2B2B] text-base">{user?.role === 'Manager' ? 'Manager workspace' : 'Member workspace'}</p>
            </div>
          </div>
          <button className="p-2 rounded-[8px] text-[#6B7878] hover:bg-[#F7F5F0]" aria-label="Notifications"><Bell size={18} /></button>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 overflow-auto pb-8">
          <Outlet />
        </main>
      </div>

      {signOutOpen && (
        <ConfirmDialog
          title="Sign out?"
          message="Are you sure you want to sign out from MessMate BD?"
          confirmLabel="Sign Out"
          danger
          onConfirm={() => {
            signOut()
            toast('Signed out.')
            setSignOutOpen(false)
          }}
          onCancel={() => setSignOutOpen(false)}
        />
      )}
    </div>
  )
}
