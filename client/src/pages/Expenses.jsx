import { useEffect, useMemo, useState } from 'react'
import { Calculator, Edit3, Receipt, ShoppingBasket, Trash2, Wallet, Zap } from 'lucide-react'
import { createExpense, deleteExpense, getExpenses, getMealRateSummary, updateExpense } from '../api/expenseService'
import { formatDate, toISO } from '../lib/date'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

const BAZAR_TYPES = ['Groceries', 'Vegetables', 'Fish & Meat', 'Rice & Lentils', 'Other']
const UTILITY_TYPES = ['Electricity', 'Gas', 'Water', 'Internet', 'Maid', 'Cleaning', 'Other']
const emptyExpense = { category: 'Bazar', type: 'Groceries', description: '', amount: '', date: toISO() }
const money = (value) => `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const monthValue = () => toISO().slice(0, 7)

export default function Expenses({ categoryMode = 'Utility' }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [month, setMonth] = useState(monthValue())
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({ ...emptyExpense, category: categoryMode, type: categoryMode === 'Bazar' ? BAZAR_TYPES[0] : UTILITY_TYPES[0] })
  const [editing, setEditing] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const canManage = user?.role === 'Manager'
  const range = useMemo(() => {
    const [year, monthNumber] = month.split('-').map(Number)
    const lastDay = new Date(year, monthNumber, 0).getDate()
    return { startDate: `${month}-01`, endDate: `${month}-${String(lastDay).padStart(2, '0')}` }
  }, [month])

  useEffect(() => { load() }, [user?.messId, month])

  useEffect(() => {
    setEditing(null)
    setForm((current) => ({
      ...current,
      category: categoryMode,
      date: current.date < range.startDate || current.date > range.endDate ? range.startDate : current.date,
    }))
  }, [range.startDate, range.endDate, categoryMode])

  async function load() {
    if (!user?.messId) return
    setLoading(true)
    try {
      const [records, mealSummary] = await Promise.all([
        getExpenses(range.startDate, range.endDate, categoryMode),
        getMealRateSummary(range.startDate, range.endDate),
      ])
      setExpenses(records)
      setSummary(mealSummary)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not load expense records.', 'warning')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      if (editing) {
        await updateExpense(editing.id, form)
        toast('Expense updated.')
      } else {
        await createExpense(form)
        toast('Expense added.')
      }
      setEditing(null)
      setForm({ ...emptyExpense, category: categoryMode, type: categoryMode === 'Bazar' ? BAZAR_TYPES[0] : UTILITY_TYPES[0], date: range.startDate })
      await load()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not save the expense.', 'warning')
    }
  }

  function startEdit(expense) {
    setEditing(expense)
    setForm({ category: expense.category, type: expense.type, description: expense.description || '', amount: expense.amount, date: expense.date })
  }

  async function handleDelete() {
    try {
      await deleteExpense(removeTarget.id)
      setRemoveTarget(null)
      toast('Expense deleted.')
      await load()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not delete the expense.', 'warning')
    }
  }

  const bazarTotal = expenses.filter((item) => item.category === 'Bazar').reduce((sum, item) => sum + Number(item.amount), 0)
  const utilityTotal = expenses.filter((item) => item.category === 'Utility').reduce((sum, item) => sum + Number(item.amount), 0)
  const isBazar = categoryMode === 'Bazar'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div><p className="text-xs text-[#1A6B3C] font-display font-700 uppercase tracking-wide">Module 2</p><h1 className="text-2xl font-display font-900 text-[#1C2B2B] mt-1">{isBazar ? 'Bazar & Grocery Management' : 'Shared Expense Management'}</h1><p className="text-sm text-[#6B7878] mt-1">{isBazar ? 'Record and track food and grocery purchases.' : 'Record and track common utility bills and shared costs.'} Guest meal records are managed under Meals.</p></div>
        <label className="bg-white border border-[#E3DED6] rounded-[9px] px-3 py-2 flex items-center gap-2"><span className="text-xs text-[#6B7878]">Month</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="text-sm font-mono outline-none" /></label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isBazar ? <><StatCard label="Bazar & groceries" value={money(bazarTotal)} icon={ShoppingBasket} /><StatCard label="Total food expense" value={money(summary?.bazarTotal)} icon={Wallet} /><StatCard label="Total meals" value={summary?.totalMeals || 0} icon={Calculator} /><StatCard label="Current meal rate" value={money(summary?.mealRate)} icon={Calculator} /></> : <><StatCard label="Utility expenses" value={money(utilityTotal)} icon={Zap} /><StatCard label="Total shared cost" value={money(utilityTotal)} icon={Wallet} /><StatCard label="Bazar expense" value={money(summary?.bazarTotal)} icon={ShoppingBasket} /><StatCard label="Mess members" value={summary?.memberCount ?? '—'} icon={Calculator} /></>}
      </div>

      {isBazar && <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-display font-800 text-[#1C2B2B]">Meal rate calculation</h2><p className="text-xs text-[#6B7878] mt-1">Food expense ÷ member meals and guest meals for the selected month.</p></div><Calculator size={20} className="text-[#1A6B3C]" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4"><SummaryBox label="Food expense" value={money(summary?.bazarTotal)} /><SummaryBox label="Total meals" value={summary?.totalMeals || 0} /><SummaryBox label="Meal rate" value={money(summary?.mealRate)} highlight /></div>
        <p className="text-[11px] text-[#8B918D] mt-3">Utility costs are shared separately and are not included in the food meal-rate calculation.</p>
      </div>}

      {canManage && <form onSubmit={handleSubmit} className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4"><Receipt size={17} className="text-[#1A6B3C]" /><div><h2 className="font-display font-800 text-[#1C2B2B]">{editing ? 'Edit expense' : 'Add expense'}</h2><p className="text-xs text-[#6B7878] mt-0.5">Record bazar purchases or shared utility bills.</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categoryMode === 'all' && <Field label="Category"><select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value, type: event.target.value === 'Bazar' ? BAZAR_TYPES[0] : UTILITY_TYPES[0] })}><option value="Bazar">Bazar</option><option value="Utility">Utility</option></select></Field>}
          <Field label={isBazar ? 'Bazar type' : 'Utility type'}><select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{(isBazar ? BAZAR_TYPES : UTILITY_TYPES).map((type) => <option key={type}>{type}</option>)}</select></Field>
          <Field label="Amount (৳)"><input required type="number" min="0.01" step="0.01" className="input" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" /></Field>
          <Field label="Date"><input required type="date" min={range.startDate} max={range.endDate} className="input" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        </div>
        <Field label="Description"><input maxLength={250} className="input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional details" /></Field>
        <div className="flex gap-2 mt-4"><button disabled={loading} className="px-4 py-2.5 rounded-[8px] bg-[#1A6B3C] text-white text-sm font-display font-700 disabled:opacity-50">{editing ? 'Update expense' : 'Add expense'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ ...emptyExpense, category: categoryMode, type: categoryMode === 'Bazar' ? BAZAR_TYPES[0] : UTILITY_TYPES[0], date: range.startDate }) }} className="px-4 py-2.5 rounded-[8px] border border-[#E3DED6] text-sm font-display font-700 text-[#6B7878]">Cancel</button>}</div>
      </form>}

      <section className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Wallet size={17} className="text-[#1A6B3C]" /><h2 className="font-display font-800 text-[#1C2B2B]">Expense history</h2></div><span className="text-xs text-[#6B7878]">{expenses.length} records</span></div>
        {expenses.length ? <div className="space-y-2">{expenses.map((expense) => <div key={expense.id} className="flex items-center gap-3 p-3 rounded-[9px] bg-[#F7F5F0]"><div className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${isBazar ? 'bg-[#E6F3EC] text-[#1A6B3C]' : 'bg-[#FFF7E6] text-[#B45309]'}`}>{isBazar ? <ShoppingBasket size={16} /> : <Zap size={16} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-display font-800 text-[#1C2B2B]">{expense.type}</p><span className="text-[10px] px-2 py-1 rounded-full bg-white border border-[#E3DED6] text-[#6B7878]">{expense.category}</span></div><p className="text-xs text-[#6B7878] mt-1 truncate">{formatDate(expense.date)}{expense.description ? ` · ${expense.description}` : ''}</p></div><p className="font-mono text-sm text-[#1C2B2B]">{money(expense.amount)}</p>{canManage && <div className="flex gap-1"><button onClick={() => startEdit(expense)} className="p-2 rounded-[7px] text-[#6B7878] hover:bg-white" aria-label="Edit expense"><Edit3 size={14} /></button><button onClick={() => setRemoveTarget(expense)} className="p-2 rounded-[7px] text-[#DC2626] hover:bg-[#FEE2E2]" aria-label="Delete expense"><Trash2 size={14} /></button></div>}</div>)}</div> : <Empty text={loading ? 'Loading expenses…' : 'No expenses recorded for this month.'} />}
      </section>

      {removeTarget && <ConfirmDialog title="Delete expense?" message={`Delete ${removeTarget.type} expense of ${money(removeTarget.amount)}?`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setRemoveTarget(null)} />}
    </div>
  )
}

function Field({ label, children }) { return <label className="block"><span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>{children}</label> }
function StatCard({ label, value, icon: Icon }) { return <div className="bg-white rounded-[12px] border border-[#E3DED6] p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs text-[#6B7878]">{label}</p><Icon size={16} className="text-[#1A6B3C]" /></div><p className="font-mono text-lg text-[#1C2B2B] mt-1">{value}</p></div> }
function SummaryBox({ label, value, highlight }) { return <div className={`rounded-[9px] p-3 ${highlight ? 'bg-[#E6F3EC]' : 'bg-[#F7F5F0]'}`}><p className="text-xs text-[#6B7878]">{label}</p><p className={`font-mono text-lg mt-1 ${highlight ? 'text-[#1A6B3C]' : 'text-[#1C2B2B]'}`}>{value}</p></div> }
function Empty({ text }) { return <div className="py-8 text-center text-sm text-[#6B7878]">{text}</div> }
