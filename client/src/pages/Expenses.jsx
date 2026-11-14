import { useEffect, useMemo, useState } from 'react'
import { Calculator, Edit3, Receipt, ShoppingBasket, Trash2, Utensils, UsersRound, Wallet, Zap } from 'lucide-react'
import { deleteExpense, deleteGuestMeal, createExpense, createGuestMeal, getExpenses, getGuestMeals, getMealRateSummary, updateExpense, updateGuestMeal } from '../api/expenseService'
import { monthEnd, monthStart, toISO, formatDate } from '../lib/date'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

const BAZAR_TYPES = ['Groceries', 'Vegetables', 'Fish & Meat', 'Rice & Lentils', 'Other']
const UTILITY_TYPES = ['Electricity', 'Gas', 'Water', 'Internet', 'Maid', 'Other']

const emptyExpense = {
  category: 'Bazar',
  type: 'Groceries',
  description: '',
  amount: '',
  date: toISO(),
}

const emptyGuest = {
  guestName: '',
  date: toISO(),
  breakfast: 0,
  lunch: 1,
  dinner: 0,
}

export default function Expenses() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [month, setMonth] = useState(toMonthValue())
  const [expenses, setExpenses] = useState([])
  const [guestMeals, setGuestMeals] = useState([])
  const [summary, setSummary] = useState(null)
  const [expenseForm, setExpenseForm] = useState(emptyExpense)
  const [guestForm, setGuestForm] = useState(emptyGuest)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingGuest, setEditingGuest] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [loading, setLoading] = useState(false)

  const canManage = user?.role === 'Manager'
  const { startDate, endDate } = useMemo(() => getMonthRange(month), [month])

  useEffect(() => {
    load()
  }, [user?.messId, month])

  useEffect(() => {
    setExpenseForm((current) => ({
      ...current,
      date: current.date < startDate || current.date > endDate ? startDate : current.date,
    }))
    setGuestForm((current) => ({
      ...current,
      date: current.date < startDate || current.date > endDate ? startDate : current.date,
    }))
  }, [startDate, endDate])

  async function load() {
    if (!user?.messId) return

    setLoading(true)
    try {
      const [nextExpenses, nextGuests, nextSummary] = await Promise.all([
        getExpenses(startDate, endDate),
        getGuestMeals(startDate, endDate),
        getMealRateSummary(startDate, endDate),
      ])

      setExpenses(nextExpenses)
      setGuestMeals(nextGuests)
      setSummary(nextSummary)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not load Module 2 data.', 'warning')
    } finally {
      setLoading(false)
    }
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault()

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseForm)
        toast('Expense updated.')
      } else {
        await createExpense(expenseForm)
        toast('Expense added.')
      }

      setExpenseForm({ ...emptyExpense, date: startDate })
      setEditingExpense(null)
      await load()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not save the expense.', 'warning')
    }
  }

  async function handleGuestSubmit(event) {
    event.preventDefault()

    try {
      if (editingGuest) {
        await updateGuestMeal(editingGuest.id, guestForm)
        toast('Guest meal updated.')
      } else {
        await createGuestMeal(guestForm)
        toast('Guest meal added.')
      }

      setGuestForm({ ...emptyGuest, date: startDate })
      setEditingGuest(null)
      await load()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not save the guest meal.', 'warning')
    }
  }

  function startExpenseEdit(expense) {
    setEditingExpense(expense)
    setExpenseForm({
      category: expense.category,
      type: expense.type,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startGuestEdit(guest) {
    setEditingGuest(guest)
    setGuestForm({
      guestName: guest.guestName,
      date: guest.date,
      breakfast: guest.breakfast,
      lunch: guest.lunch,
      dinner: guest.dinner,
    })
  }

  async function handleRemove() {
    if (!removeTarget) return

    try {
      if (removeTarget.kind === 'expense') {
        await deleteExpense(removeTarget.id)
        toast('Expense deleted.')
      } else {
        await deleteGuestMeal(removeTarget.id)
        toast('Guest meal deleted.')
      }

      setRemoveTarget(null)
      await load()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not delete the record.', 'warning')
    }
  }

  const bazarTotal = expenses
    .filter((expense) => expense.category === 'Bazar')
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  const utilityTotal = expenses
    .filter((expense) => expense.category === 'Utility')
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs text-[#1A6B3C] font-display font-700 uppercase tracking-wide">Module 2</p>
          <h1 className="text-2xl font-display font-900 text-[#1C2B2B] mt-1">Meal & Expense Management</h1>
          <p className="text-sm text-[#6B7878] mt-0.5">
            {canManage ? 'Manage bazar, shared utilities, guest meals, and the monthly meal rate.' : 'View mess expenses, guest meals, and the current meal rate.'}
          </p>
        </div>
        <label className="bg-white border border-[#E3DED6] rounded-[9px] px-3 py-2 flex items-center gap-2">
          <span className="text-xs text-[#6B7878]">Month</span>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="text-sm font-mono outline-none" />
        </label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Bazar" value={money(bazarTotal)} icon={ShoppingBasket} />
        <StatCard label="Utilities" value={money(utilityTotal)} icon={Zap} />
        <StatCard label="Member meals" value={summary?.memberMeals || 0} icon={Utensils} />
        <StatCard label="Guest meals" value={summary?.guestMeals || 0} icon={UsersRound} />
        <StatCard label="Meal rate" value={money(summary?.mealRate || 0)} icon={Calculator} />
      </div>

      <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-800 text-[#1C2B2B]">Automatic meal rate</h2>
            <p className="text-xs text-[#6B7878] mt-1">Food expenses divided by total member and guest meals for {formatMonth(month)}.</p>
          </div>
          <div className="w-11 h-11 rounded-[10px] bg-[#E6F3EC] text-[#1A6B3C] flex items-center justify-center">
            <Calculator size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <SummaryBox label="Food expense" value={money(summary?.bazarTotal || 0)} />
          <SummaryBox label="Total meals" value={summary?.totalMeals || 0} />
          <SummaryBox label="Current meal rate" value={money(summary?.mealRate || 0)} highlight />
        </div>

        <p className="text-[11px] text-[#A09C94] mt-3">
          Utility costs are kept separate from the food expense used for the meal-rate calculation.
        </p>
      </div>

      {canManage && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <form onSubmit={handleExpenseSubmit} className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Receipt size={17} className="text-[#1A6B3C]" />
              <div>
                <h2 className="font-display font-800 text-[#1C2B2B]">{editingExpense ? 'Edit expense' : 'Add expense'}</h2>
                <p className="text-xs text-[#6B7878] mt-0.5">Bazar and shared utility records.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value, type: event.target.value === 'Bazar' ? BAZAR_TYPES[0] : UTILITY_TYPES[0] })} className="input">
                  <option>Bazar</option>
                  <option>Utility</option>
                </select>
              </Field>
              <Field label={expenseForm.category === 'Bazar' ? 'Bazar type' : 'Utility type'}>
                <select value={expenseForm.type} onChange={(event) => setExpenseForm({ ...expenseForm, type: event.target.value })} className="input">
                  {(expenseForm.category === 'Bazar' ? BAZAR_TYPES : UTILITY_TYPES).map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Amount (৳)">
                <input required type="number" min="1" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} className="input" placeholder="0" />
              </Field>
              <Field label="Date">
                <input required type="date" min={startDate} max={endDate} value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} className="input" />
              </Field>
            </div>

            <Field label="Description">
              <input value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} className="input" placeholder="Optional note" />
            </Field>

            <div className="flex gap-2 mt-4">
              <button disabled={loading} className="px-4 py-2.5 rounded-[8px] bg-[#1A6B3C] text-white text-sm font-display font-700 disabled:opacity-50">{editingExpense ? 'Update expense' : 'Add expense'}</button>
              {editingExpense && <button type="button" onClick={() => { setEditingExpense(null); setExpenseForm({ ...emptyExpense, date: startDate }) }} className="px-4 py-2.5 rounded-[8px] border border-[#E3DED6] text-sm font-display font-700 text-[#6B7878]">Cancel</button>}
            </div>
          </form>

          <form onSubmit={handleGuestSubmit} className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UsersRound size={17} className="text-[#1A6B3C]" />
              <div>
                <h2 className="font-display font-800 text-[#1C2B2B]">{editingGuest ? 'Edit guest meal' : 'Record guest meal'}</h2>
                <p className="text-xs text-[#6B7878] mt-0.5">Guest meals are included in the total meal count.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Guest name">
                <input required value={guestForm.guestName} onChange={(event) => setGuestForm({ ...guestForm, guestName: event.target.value })} className="input" placeholder="Guest name" />
              </Field>
              <Field label="Date">
                <input required type="date" min={startDate} max={endDate} value={guestForm.date} onChange={(event) => setGuestForm({ ...guestForm, date: event.target.value })} className="input" />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <NumberField label="Breakfast" value={guestForm.breakfast} onChange={(value) => setGuestForm({ ...guestForm, breakfast: value })} />
              <NumberField label="Lunch" value={guestForm.lunch} onChange={(value) => setGuestForm({ ...guestForm, lunch: value })} />
              <NumberField label="Dinner" value={guestForm.dinner} onChange={(value) => setGuestForm({ ...guestForm, dinner: value })} />
            </div>

            <div className="flex gap-2 mt-4">
              <button disabled={loading} className="px-4 py-2.5 rounded-[8px] bg-[#1A6B3C] text-white text-sm font-display font-700 disabled:opacity-50">{editingGuest ? 'Update guest meal' : 'Add guest meal'}</button>
              {editingGuest && <button type="button" onClick={() => { setEditingGuest(null); setGuestForm({ ...emptyGuest, date: startDate }) }} className="px-4 py-2.5 rounded-[8px] border border-[#E3DED6] text-sm font-display font-700 text-[#6B7878]">Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecordCard
          title="Bazar & utility expenses"
          icon={Wallet}
          empty="No expenses recorded for this month."
        >
          {expenses.length === 0 ? <Empty text="No expenses recorded for this month." /> : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 p-3 rounded-[9px] bg-[#F7F5F0]">
                  <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${expense.category === 'Bazar' ? 'bg-[#E6F3EC] text-[#1A6B3C]' : 'bg-[#FFF7E6] text-[#B45309]'}`}>
                    {expense.category === 'Bazar' ? <ShoppingBasket size={16} /> : <Zap size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-display font-800 text-[#1C2B2B]">{expense.type}</p>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-[#E3DED6] text-[#6B7878]">{expense.category}</span>
                    </div>
                    <p className="text-xs text-[#6B7878] mt-1 truncate">{formatDate(expense.date)}{expense.description ? ` · ${expense.description}` : ''}</p>
                  </div>
                  <p className="font-mono text-sm text-[#1C2B2B]">{money(expense.amount)}</p>
                  {canManage && <div className="flex gap-1">
                    <button onClick={() => startExpenseEdit(expense)} className="p-2 rounded-[7px] text-[#6B7878] hover:bg-white" aria-label="Edit expense"><Edit3 size={14} /></button>
                    <button onClick={() => setRemoveTarget({ kind: 'expense', id: expense.id, name: expense.type })} className="p-2 rounded-[7px] text-[#DC2626] hover:bg-[#FEE2E2]" aria-label="Delete expense"><Trash2 size={14} /></button>
                  </div>}
                </div>
              ))}
            </div>
          )}
        </RecordCard>

        <RecordCard title="Guest meals" icon={UsersRound} empty="No guest meals recorded for this month.">
          {guestMeals.length === 0 ? <Empty text="No guest meals recorded for this month." /> : (
            <div className="space-y-2">
              {guestMeals.map((guest) => (
                <div key={guest.id} className="flex items-center gap-3 p-3 rounded-[9px] bg-[#F7F5F0]">
                  <div className="w-9 h-9 rounded-full bg-[#EEF7F2] text-[#1A6B3C] flex items-center justify-center text-xs font-display font-800">{guest.guestName[0]?.toUpperCase()}</div>
                  <div className="flex-1">
                    <p className="text-sm font-display font-800 text-[#1C2B2B]">{guest.guestName}</p>
                    <p className="text-xs text-[#6B7878] mt-1">{formatDate(guest.date)} · B {guest.breakfast} · L {guest.lunch} · D {guest.dinner}</p>
                  </div>
                  <p className="font-mono text-sm text-[#1C2B2B]">{guest.totalMeals}</p>
                  {canManage && <div className="flex gap-1">
                    <button onClick={() => startGuestEdit(guest)} className="p-2 rounded-[7px] text-[#6B7878] hover:bg-white" aria-label="Edit guest meal"><Edit3 size={14} /></button>
                    <button onClick={() => setRemoveTarget({ kind: 'guest', id: guest.id, name: guest.guestName })} className="p-2 rounded-[7px] text-[#DC2626] hover:bg-[#FEE2E2]" aria-label="Delete guest meal"><Trash2 size={14} /></button>
                  </div>}
                </div>
              ))}
            </div>
          )}
        </RecordCard>
      </div>

      {summary?.guestMealValue > 0 && (
        <div className="bg-[#EEF7F2] border border-[#C8E3D2] rounded-[12px] p-4">
          <p className="text-xs text-[#1A6B3C] font-display font-800">Guest meal value</p>
          <p className="text-sm text-[#6B7878] mt-1">
            {summary.guestMeals} guest meals × {money(summary.mealRate)} = <span className="font-mono text-[#1C2B2B]">{money(summary.guestMealValue)}</span>
          </p>
        </div>
      )}

      {removeTarget && (
        <ConfirmDialog
          title={`Delete ${removeTarget.kind === 'expense' ? 'expense' : 'guest meal'}?`}
          message={`This will permanently remove ${removeTarget.name || 'this record'} from the month.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E3DED6] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7878]">{label}</p>
        <Icon size={15} className="text-[#1A6B3C]" />
      </div>
      <p className="font-mono text-lg text-[#1C2B2B] mt-1">{value}</p>
    </div>
  )
}

function SummaryBox({ label, value, highlight }) {
  return (
    <div className={`rounded-[9px] p-3 ${highlight ? 'bg-[#E6F3EC]' : 'bg-[#F7F5F0]'}`}>
      <p className="text-xs text-[#6B7878]">{label}</p>
      <p className={`font-mono text-lg mt-1 ${highlight ? 'text-[#1A6B3C]' : 'text-[#1C2B2B]'}`}>{value}</p>
    </div>
  )
}

function RecordCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={17} className="text-[#1A6B3C]" />
        <h2 className="font-display font-800 text-[#1C2B2B]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>{children}</label>
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>
      <input type="number" min="0" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} className="input" />
    </label>
  )
}

function Empty({ text }) {
  return <div className="py-8 text-center text-sm text-[#6B7878]">{text}</div>
}

function money(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function toMonthValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRange(value) {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return {
    startDate: monthStart(date),
    endDate: monthEnd(date),
  }
}

function formatMonth(value) {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
