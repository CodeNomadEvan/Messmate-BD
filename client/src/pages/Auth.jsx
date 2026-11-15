import { useState } from 'react'
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LogIn, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Auth() {
  const { signIn, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('Member')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    identifier: '', name: '', email: '', phone: '', password: '', messCode: '', messName: '', area: '', address: '',
  })

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  async function handleSubmit() {
    if (busy) return
    setError('')
    setBusy(true)

    try {
      const result = mode === 'login'
        ? await signIn(form.identifier, form.password)
        : await register({ ...form, role })

      if (!result.ok) {
        setError(result.error)
        return
      }

      navigate('/dashboard')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] grid lg:grid-cols-[1.02fr_.98fr]">
      <section className="hidden lg:flex bg-[#1A6B3C] text-white p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[36px] border-white/5" />
        <div className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full border-[28px] border-white/5" />
        <div className="max-w-lg self-center relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white rounded-[12px] p-2"><Logo size={40} /></div>
            <div>
              <p className="font-display font-900 text-xl">MessMate BD</p>
              <p className="text-xs text-green-100">একসাথে থাকি, হিসাবটা সহজ রাখি।</p>
            </div>
          </div>
          <p className="text-green-100 text-sm mb-2">Live together. Eat together. Split fairly.</p>
          <h1 className="text-4xl xl:text-5xl font-display font-900 leading-tight">One simple place for your mess, meals and monthly হিসাব.</h1>
          <div className="mt-9 space-y-3">
            {['Daily meals & meal-off tracking', 'Members and roles in one place', 'Simple mess code based joining'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-green-50"><CheckCircle2 size={17} className="text-green-200" />{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><Logo size={36} /><div><p className="font-display font-900 text-[#1C2B2B]">MessMate BD</p><p className="text-[10px] text-[#6B7878]">একসাথে থাকি, হিসাবটা সহজ রাখি।</p></div></div>

          <div className="bg-white border border-[#E3DED6] rounded-[16px] shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 p-1 bg-[#F7F5F0] rounded-[10px] mb-7">
              <button onClick={() => switchMode('login')} className={`flex-1 py-2 rounded-[8px] text-sm font-display font-700 ${mode === 'login' ? 'bg-white text-[#1A6B3C] shadow-sm' : 'text-[#6B7878]'}`}>Login</button>
              <button onClick={() => switchMode('signup')} className={`flex-1 py-2 rounded-[8px] text-sm font-display font-700 ${mode === 'signup' ? 'bg-white text-[#1A6B3C] shadow-sm' : 'text-[#6B7878]'}`}>Create Account</button>
            </div>

            <div className="mb-6"><h2 className="font-display font-900 text-2xl text-[#1C2B2B]">{mode === 'login' ? 'Welcome back 👋' : 'Set up your account'}</h2><p className="text-sm text-[#6B7878] mt-1">{mode === 'login' ? 'Use your email or phone to continue.' : 'Choose how you will use MessMate BD.'}</p></div>

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {['Manager', 'Member'].map((item) => (
                  <button key={item} onClick={() => setRole(item)} className={`flex items-center justify-center gap-2 py-2.5 rounded-[9px] border text-sm font-display font-700 ${role === item ? 'bg-[#E6F3EC] border-[#1A6B3C]/30 text-[#1A6B3C]' : 'border-[#E3DED6] text-[#6B7878]'}`}>
                    {item === 'Manager' ? <KeyRound size={15} /> : <Users size={15} />}{item}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3.5">
              {mode === 'signup' && <Field label="Full Name"><input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="Your full name" /></Field>}
              <Field label={mode === 'login' ? 'Email or phone' : 'Email'}><input value={mode === 'login' ? form.identifier : form.email} onChange={(e) => update(mode === 'login' ? 'identifier' : 'email', e.target.value)} className="input" placeholder={mode === 'login' ? 'name@example.com' : 'name@example.com'} /></Field>
              {mode === 'signup' && <Field label="Phone"><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" placeholder="01711-234567" /></Field>}
              <Field label="Password"><div className="relative"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className="input pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7878]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field>
              {mode === 'signup' && role === 'Member' && <Field label="Mess Code"><input value={form.messCode} onChange={(e) => update('messCode', e.target.value.toUpperCase())} className="input font-mono tracking-wider" placeholder="MM-1234" /></Field>}
              {mode === 'signup' && role === 'Manager' && <>
                <Field label="Mess Name"><input value={form.messName} onChange={(e) => update('messName', e.target.value)} className="input" placeholder="Your mess name" /></Field>
                <div className="grid grid-cols-2 gap-3"><Field label="Area"><input value={form.area} onChange={(e) => update('area', e.target.value)} className="input" placeholder="Mirpur" /></Field><Field label="Address"><input value={form.address} onChange={(e) => update('address', e.target.value)} className="input" placeholder="House / Road" /></Field></div>
              </>}
            </div>

            {error && <p className="mt-3 text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2">{error}</p>}
            <button onClick={handleSubmit} disabled={busy} className="w-full mt-5 py-2.5 rounded-[9px] bg-[#1A6B3C] text-white font-display font-800 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>{children}</label>
}
