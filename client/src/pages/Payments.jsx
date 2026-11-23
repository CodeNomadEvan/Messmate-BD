import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Plus, Trash2, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { getMessUsers } from '../api/memberService'
import { createPayment, deletePayment, getPayments, getMonthlyReport } from '../api/module3Service'
import { toISO } from '../lib/date'

const money = (value) => `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const currentMonth = () => toISO().slice(0, 7)

export default function Payments() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [month, setMonth] = useState(currentMonth())
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [report, setReport] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [form, setForm] = useState({ memberId: '', amount: '', method: 'Cash', date: toISO(), note: '' })
  const [loading, setLoading] = useState(false)
  const range = useMemo(() => { const [year, monthNumber] = month.split('-').map(Number); const lastDay = new Date(year, monthNumber, 0).getDate(); return { start: `${month}-01`, end: `${month}-${String(lastDay).padStart(2, '0')}` } }, [month])

  useEffect(() => { load() }, [user?.messId, month])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      date: current.date < range.start || current.date > range.end ? range.start : current.date,
    }))
  }, [range.start, range.end])

  async function load() {
    if (!user?.messId) return
    setLoading(true)
    try {
      const [memberList, paymentList, reportData] = await Promise.all([
        getMessUsers(), getPayments(range.start, range.end, user.role === 'Member' ? user.id : undefined), getMonthlyReport(month),
      ])
      setMembers(memberList)
      setPayments(paymentList)
      setReport(reportData)
      if (!form.memberId && memberList.length) setForm((old) => ({ ...old, memberId: memberList[0].id }))
    } catch (error) { toast(error.response?.data?.message || 'Could not load payment records.', 'warning') }
    finally { setLoading(false) }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      await createPayment({ ...form, date: form.date || range.start })
      setForm((old) => ({ ...old, amount: '', note: '', date: range.start }))
      toast('Payment recorded successfully.')
      await load()
    } catch (error) { toast(error.response?.data?.message || 'Could not record payment.', 'warning') }
  }

  async function handleDelete() {
    try { await deletePayment(removeTarget.id); setRemoveTarget(null); toast('Payment deleted.'); await load() }
    catch (error) { toast(error.response?.data?.message || 'Could not delete payment.', 'warning') }
  }

  const own = report?.memberReports?.find((item) => item.memberId === user.id)
  const visibleReports = user.role === 'Manager' ? report?.memberReports || [] : own ? [own] : []

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><p className="text-xs text-[#1A6B3C] font-display font-700 uppercase tracking-wide">Module 3</p><h1 className="text-2xl font-display font-900 text-[#1C2B2B] mt-1">Payments & Due Tracking</h1><p className="text-sm text-[#6B7878] mt-1">Payment history, member costs, outstanding dues and advance balances.</p></div><label className="bg-white border border-[#E3DED6] rounded-[9px] px-3 py-2 flex items-center gap-2 text-xs text-[#6B7878]">Month <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="text-sm text-[#1C2B2B] outline-none" /></label></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Stat label="Total cost" value={money(report?.totalCost)} /><Stat label="Total collected" value={money(report?.totalPaid)} /><Stat label="Outstanding due" value={money(report?.totalDue)} /><Stat label="Advance" value={money(report?.totalAdvance)} /></div>
    {user.role === 'Manager' && <form onSubmit={handleSubmit} className="bg-white border border-[#E3DED6] rounded-[12px] p-5 shadow-sm"><div className="flex items-center gap-2 mb-4"><Plus size={17} className="text-[#1A6B3C]"/><h2 className="font-display font-800">Record a payment</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3"><Field label="Member"><select required className="input" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field><Field label="Amount (৳)"><input required min="0.01" step="0.01" type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}/></Field><Field label="Method"><select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{['Cash','bKash','Nagad','Bank','Other'].map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="Date"><input required type="date" min={range.start} max={range.end} className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/></Field><Field label="Note"><input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional"/></Field></div><button disabled={loading || !members.length} className="mt-4 px-4 py-2.5 rounded-[8px] bg-[#1A6B3C] text-white text-sm font-display font-700 disabled:opacity-50">Save payment</button></form>}
    <section className="bg-white border border-[#E3DED6] rounded-[12px] p-5 shadow-sm"><div className="flex items-center gap-2 mb-4"><Wallet size={18} className="text-[#1A6B3C]"/><h2 className="font-display font-800">Member cost & due summary</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-[#6B7878] border-b border-[#E3DED6]"><th className="py-3 pr-3">Member</th><th className="py-3 pr-3">Member meals</th><th className="py-3 pr-3">Guest meals</th><th className="py-3 pr-3">Total meals</th><th className="py-3 pr-3">Cost</th><th className="py-3 pr-3">Paid</th><th className="py-3 pr-3">Due</th><th className="py-3">Advance</th></tr></thead><tbody>{visibleReports.map((item) => <tr key={item.memberId} className="border-b border-[#F2EFE9]"><td className="py-3 pr-3 font-display font-700">{item.memberName}</td><td className="py-3 pr-3">{item.memberMealCount}</td><td className="py-3 pr-3">{item.guestMealCount}</td><td className="py-3 pr-3">{item.mealCount}</td><td className="py-3 pr-3">{money(item.totalCost)}</td><td className="py-3 pr-3">{money(item.totalPaid)}</td><td className="py-3 pr-3 text-[#DC2626]">{money(item.due)}</td><td className="py-3 text-[#1A6B3C]">{money(item.advance)}</td></tr>)}</tbody></table>{!visibleReports.length && <Empty text="No member cost data for this month."/>}</div></section>
    <section className="bg-white border border-[#E3DED6] rounded-[12px] p-5 shadow-sm"><h2 className="font-display font-800 mb-4">Payment history</h2>{payments.length ? <div className="space-y-2">{payments.map((payment) => <div key={payment.id} className="flex items-center gap-3 p-3 bg-[#F7F5F0] rounded-[9px]"><div className="w-9 h-9 rounded-lg bg-[#E6F3EC] text-[#1A6B3C] flex items-center justify-center"><CreditCard size={17}/></div><div className="flex-1 min-w-0"><p className="text-sm font-display font-700">{payment.memberName} · {money(payment.amount)}</p><p className="text-xs text-[#6B7878]">{payment.date} · {payment.method}{payment.note ? ` · ${payment.note}` : ''}</p></div>{user.role === 'Manager' && <button onClick={() => setRemoveTarget(payment)} className="p-2 text-[#DC2626]" title="Delete payment"><Trash2 size={15}/></button>}</div>)}</div> : <Empty text="No payments recorded for this month."/>}</section>
    {removeTarget && <ConfirmDialog title="Delete payment?" message={`Delete ${money(removeTarget.amount)} payment from ${removeTarget.memberName}?`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setRemoveTarget(null)}/>}
  </div>
}
function Field({label,children}) { return <label className="block"><span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>{children}</label> }
function Stat({label,value}) { return <div className="bg-white rounded-[12px] border border-[#E3DED6] p-4 shadow-sm"><p className="text-xs text-[#6B7878]">{label}</p><p className="font-mono text-xl mt-1 text-[#1C2B2B]">{value}</p></div> }
function Empty({text}) { return <p className="text-sm text-[#8B918D] text-center py-8">{text}</p> }
