import { useEffect, useState } from 'react'
import { Edit3, Plus, Trash2, UsersRound } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'
import {
  createGuestMeal,
  deleteGuestMeal,
  getGuestMeals,
  updateGuestMeal,
} from '../api/guestMealService'
import { formatDate, monthEnd, monthStart, toISO } from '../lib/date'

const emptyForm = {
  guestName: '',
  hostMemberId: '',
  date: toISO(),
  breakfast: 0,
  lunch: 1,
  dinner: 0,
}

export default function GuestMealsPanel({ members = [], canManage = false }) {
  const { toast } = useToast()
  const [guestMeals, setGuestMeals] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadGuestMeals()
  }, [canManage])

  async function loadGuestMeals() {
    setLoading(true)
    try {
      const records = await getGuestMeals(monthStart(), monthEnd())
      setGuestMeals(records)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not load guest meals.', 'warning')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ ...emptyForm, hostMemberId: members[0]?.id || '', date: toISO() })
    setEditing(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.guestName.trim() || !form.hostMemberId) {
      toast('Enter guest name and select the host member.', 'warning')
      return
    }

    const total = Number(form.breakfast) + Number(form.lunch) + Number(form.dinner)
    if (!Number.isInteger(total) || total < 1) {
      toast('Add at least one guest meal.', 'warning')
      return
    }

    setLoading(true)
    try {
      if (editing) {
        await updateGuestMeal(editing.id, form)
        toast('Guest meal updated.')
      } else {
        await createGuestMeal(form)
        toast('Guest meal recorded.')
      }
      resetForm()
      await loadGuestMeals()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not save guest meal.', 'warning')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(guest) {
    setEditing(guest)
    setForm({
      guestName: guest.guestName,
      hostMemberId: guest.hostMemberId || '',
      date: guest.date,
      breakfast: guest.breakfast,
      lunch: guest.lunch,
      dinner: guest.dinner,
    })
  }

  async function handleDelete() {
    if (!removeTarget) return
    try {
      await deleteGuestMeal(removeTarget.id)
      setRemoveTarget(null)
      toast('Guest meal deleted.')
      await loadGuestMeals()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not delete guest meal.', 'warning')
    }
  }

  return (
    <section className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-[9px] bg-[#E6F3EC] text-[#1A6B3C] flex items-center justify-center">
          <UsersRound size={17} />
        </div>
        <div>
          <h2 className="font-display font-800 text-[#1C2B2B]">Guest Meals</h2>
          <p className="text-xs text-[#6B7878] mt-0.5">Guest consumption and hosting member records</p>
        </div>
        <span className="ml-auto text-xs text-[#6B7878]">{guestMeals.length} records</span>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="rounded-[10px] bg-[#F7F5F0] p-4">
          <h3 className="text-sm font-display font-800 text-[#1C2B2B] mb-3">
            {editing ? 'Edit guest meal' : 'Add guest meal'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Guest name">
              <input required maxLength={80} className="input" value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
            </Field>
            <Field label="Hosted by">
              <select required className="input" value={form.hostMemberId}
                onChange={(e) => setForm({ ...form, hostMemberId: e.target.value })}>
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input required type="date" min={monthStart()} max={monthEnd()}
                className="input" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="Breakfast" value={form.breakfast}
                onChange={(value) => setForm({ ...form, breakfast: value })} />
              <NumberField label="Lunch" value={form.lunch}
                onChange={(value) => setForm({ ...form, lunch: value })} />
              <NumberField label="Dinner" value={form.dinner}
                onChange={(value) => setForm({ ...form, dinner: value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button disabled={loading || !members.length}
              className="px-4 py-2 rounded-[8px] bg-[#1A6B3C] text-white text-xs font-display font-700 disabled:opacity-50">
              <Plus size={14} className="inline mr-1" />
              {editing ? 'Update guest meal' : 'Record guest meal'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm}
                className="px-4 py-2 rounded-[8px] border border-[#E3DED6] text-xs">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading && guestMeals.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#6B7878]">Loading guest meals...</p>
      ) : guestMeals.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#8B918D]">No guest meals recorded for this month.</p>
      ) : (
        <div className="space-y-2">
          {guestMeals.map((guest) => (
            <div key={guest.id} className="flex items-center gap-3 p-3 rounded-[9px] bg-[#F7F5F0]">
              <div className="w-9 h-9 rounded-full bg-[#EEF7F2] text-[#1A6B3C] flex items-center justify-center text-xs font-display font-800">
                {guest.guestName?.[0]?.toUpperCase() || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-800 text-[#1C2B2B]">{guest.guestName}</p>
                <p className="text-xs text-[#6B7878] mt-1">
                  Hosted by {guest.hostMemberName || 'Unassigned'} · {formatDate(guest.date)}
                  {' · '}B {guest.breakfast} · L {guest.lunch} · D {guest.dinner}
                </p>
              </div>
              <span className="font-mono text-sm">{guest.totalMeals} meals</span>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => startEdit(guest)} className="p-2 rounded-[7px] text-[#6B7878]" aria-label="Edit guest meal">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => setRemoveTarget(guest)} className="p-2 rounded-[7px] text-[#DC2626]" aria-label="Delete guest meal">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[#8B918D]">
        Guest meals are included in meal-rate calculations and assigned to the hosting member.
      </p>

      {removeTarget && (
        <ConfirmDialog title="Delete guest meal?"
          message={`Delete the guest meal record for ${removeTarget.guestName}?`}
          confirmLabel="Delete" danger onConfirm={handleDelete}
          onCancel={() => setRemoveTarget(null)} />
      )}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function NumberField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input type="number" min="0" max="50" step="1" required
        className="input" value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  )
}
