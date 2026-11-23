import { useEffect, useState } from 'react'
import { Edit3, Plus, Trash2, UsersRound } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'
import { createGuestMeal, deleteGuestMeal, getGuestMeals, updateGuestMeal, createGuestMealRequest, getMyGuestMealRequests, getPendingGuestMealRequests, reviewGuestMealRequest } from '../api/guestMealService'
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
  const [requests, setRequests] = useState([])
  const [requestForm, setRequestForm] = useState({ guestName: '', date: toISO(), breakfast: 0, lunch: 1, dinner: 0, note: '' })
  const [requestLoading, setRequestLoading] = useState(false)
  const [guestMeals, setGuestMeals] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadGuestMeals()
    loadRequests()
  }, [canManage])

  async function loadRequests() {
    try {
      const items = canManage ? await getPendingGuestMealRequests() : await getMyGuestMealRequests()
      setRequests(items)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not load guest meal requests.', 'warning')
    }
  }

  async function submitGuestMealRequest(event) {
    event.preventDefault()
    const total = Number(requestForm.breakfast) + Number(requestForm.lunch) + Number(requestForm.dinner)
    if (!requestForm.guestName.trim() || total < 1) {
      toast('Enter a guest name and at least one meal.', 'warning')
      return
    }
    setRequestLoading(true)
    try {
      await createGuestMealRequest(requestForm)
      setRequestForm({ guestName: '', date: toISO(), breakfast: 0, lunch: 1, dinner: 0, note: '' })
      toast('Guest meal request sent to the Manager.')
      await loadRequests()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not send the request.', 'warning')
    } finally { setRequestLoading(false) }
  }

  async function handleReviewRequest(id, status) {
    try {
      await reviewGuestMealRequest(id, status)
      toast(status === 'Approved' ? 'Request approved and added to guest meals.' : 'Guest meal request rejected.')
      await Promise.all([loadRequests(), loadGuestMeals()])
    } catch (error) {
      toast(error.response?.data?.message || 'Could not review the request.', 'warning')
    }
  }

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
    if (!form.hostMemberId) {
      toast('Select the member who hosted the guest.', 'warning')
      return
    }

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
      toast(error.response?.data?.message || 'Could not save the guest meal.', 'warning')
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
    try {
      await deleteGuestMeal(removeTarget.id)
      setRemoveTarget(null)
      toast('Guest meal deleted.')
      await loadGuestMeals()
    } catch (error) {
      toast(error.response?.data?.message || 'Could not delete the guest meal.', 'warning')
    }
  }

  return (
    <section className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[9px] bg-[#E6F3EC] text-[#1A6B3C] flex items-center justify-center"><UsersRound size={17} /></div>
          <div>
            <h2 className="font-display font-800 text-[#1C2B2B]">Guest Meals</h2>
            <p className="text-xs text-[#6B7878] mt-0.5">Record guest consumption and assign its cost to the hosting member.</p>
          </div>
        </div>
        <span className="text-xs text-[#6B7878] whitespace-nowrap">{guestMeals.length} records</span>
      </div>

      {!canManage && (
        <form onSubmit={submitGuestMealRequest} className="rounded-[10px] bg-[#F7F5F0] p-4 space-y-3">
          <div><h3 className="text-sm font-display font-800 text-[#1C2B2B]">Request a Guest Meal</h3><p className="text-xs text-[#6B7878] mt-1">Send your guest meal details to the Manager. It will be added to your account only after approval.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Guest name"><input required maxLength={80} className="input" value={requestForm.guestName} onChange={(event) => setRequestForm({ ...requestForm, guestName: event.target.value })} placeholder="Guest name" /></Field>
            <Field label="Date"><input required type="date" min={toISO()} className="input" value={requestForm.date} onChange={(event) => setRequestForm({ ...requestForm, date: event.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-2"><NumberField label="Breakfast" value={requestForm.breakfast} onChange={(value) => setRequestForm({ ...requestForm, breakfast: value })} /><NumberField label="Lunch" value={requestForm.lunch} onChange={(value) => setRequestForm({ ...requestForm, lunch: value })} /><NumberField label="Dinner" value={requestForm.dinner} onChange={(value) => setRequestForm({ ...requestForm, dinner: value })} /></div>
            <Field label="Note (optional)"><input maxLength={500} className="input" value={requestForm.note} onChange={(event) => setRequestForm({ ...requestForm, note: event.target.value })} placeholder="Any details for Manager" /></Field>
          </div>
          <button disabled={requestLoading} className="px-4 py-2 rounded-[8px] bg-[#1A6B3C] text-white text-xs font-display font-700 disabled:opacity-50">{requestLoading ? 'Sending…' : 'Send Guest Meal Request'}</button>
        </form>
      )}

      <div className="space-y-3">
        <div><h3 className="text-sm font-display font-800 text-[#1C2B2B]">{canManage ? 'Pending Guest Meal Requests' : 'My Guest Meal Requests'}</h3><p className="text-xs text-[#6B7878] mt-1">{canManage ? 'Approve a request to add it to the official guest meal records and member cost.' : 'Track the approval status of your requests.'}</p></div>
        {requests.length === 0 ? <div className="py-5 text-center text-sm text-[#8B918D]">{canManage ? 'No pending guest meal requests.' : 'You have not submitted any guest meal requests.'}</div> : requests.map((request) => (
          <div key={request.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-[9px] bg-[#F7F5F0]">
            <div className="flex-1 min-w-0"><p className="text-sm font-display font-800 text-[#1C2B2B]">{request.guestName} {canManage && <span className="font-normal text-[#6B7878]">· {request.memberName}</span>}</p><p className="text-xs text-[#6B7878] mt-1">{formatDate(request.date)} · B {request.breakfast} · L {request.lunch} · D {request.dinner}</p>{request.note && <p className="text-xs text-[#6B7878] mt-1">Note: {request.note}</p>}</div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-display font-700 self-start ${request.status === 'Approved' ? 'bg-[#E6F3EC] text-[#1A6B3C]' : request.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>{request.status}</span>
            {canManage && <div className="flex gap-2"><button onClick={() => handleReviewRequest(request.id, 'Approved')} className="px-3 py-2 rounded-[8px] bg-[#1A6B3C] text-white text-xs font-display font-700">Approve</button><button onClick={() => handleReviewRequest(request.id, 'Rejected')} className="px-3 py-2 rounded-[8px] bg-[#FEF2F2] text-[#DC2626] text-xs font-display font-700">Reject</button></div>}
          </div>
        ))}
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="rounded-[10px] bg-[#F7F5F0] p-4">
          <h3 className="text-sm font-display font-800 text-[#1C2B2B] mb-3">{editing ? 'Edit guest meal' : 'Add guest meal'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Guest name"><input required maxLength={80} className="input" value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} placeholder="Guest name" /></Field>
            <Field label="Hosted by"><select required className="input" value={form.hostMemberId} onChange={(event) => setForm({ ...form, hostMemberId: event.target.value })}><option value="">Select member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field>
            <Field label="Date"><input required type="date" min={monthStart()} max={monthEnd()} className="input" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="Breakfast" value={form.breakfast} onChange={(value) => setForm({ ...form, breakfast: value })} />
              <NumberField label="Lunch" value={form.lunch} onChange={(value) => setForm({ ...form, lunch: value })} />
              <NumberField label="Dinner" value={form.dinner} onChange={(value) => setForm({ ...form, dinner: value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button disabled={loading || !members.length} className="px-4 py-2 rounded-[8px] bg-[#1A6B3C] text-white text-xs font-display font-700 disabled:opacity-50"><Plus size={14} className="inline mr-1" />{editing ? 'Update guest meal' : 'Record guest meal'}</button>
            {editing && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-[8px] border border-[#E3DED6] text-xs font-display font-700 text-[#6B7878]">Cancel</button>}
          </div>
        </form>
      )}

      {guestMeals.length ? (
        <div className="space-y-2">
          {guestMeals.map((guest) => (
            <div key={guest.id} className="flex items-center gap-3 p-3 rounded-[9px] bg-[#F7F5F0]">
              <div className="w-9 h-9 rounded-full bg-[#EEF7F2] text-[#1A6B3C] flex items-center justify-center text-xs font-display font-800">{guest.guestName?.[0]?.toUpperCase() || 'G'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-800 text-[#1C2B2B]">{guest.guestName}</p>
                <p className="text-xs text-[#6B7878] mt-1">Hosted by {guest.hostMemberName || 'Unassigned'} · {formatDate(guest.date)} · B {guest.breakfast} · L {guest.lunch} · D {guest.dinner}</p>
              </div>
              <span className="font-mono text-sm text-[#1C2B2B]">{guest.totalMeals} meals</span>
              {canManage && <div className="flex gap-1"><button onClick={() => startEdit(guest)} className="p-2 rounded-[7px] text-[#6B7878] hover:bg-white" aria-label="Edit guest meal"><Edit3 size={14} /></button><button onClick={() => setRemoveTarget(guest)} className="p-2 rounded-[7px] text-[#DC2626] hover:bg-[#FEE2E2]" aria-label="Delete guest meal"><Trash2 size={14} /></button></div>}
            </div>
          ))}
        </div>
      ) : <div className="py-7 text-center text-sm text-[#8B918D]">{loading ? 'Loading guest meals…' : 'No guest meals recorded for this month.'}</div>}

      <p className="text-[11px] text-[#8B918D]">Guest meals are included in the meal-rate denominator. Their cost is charged to the selected host member in monthly cost and due reports.</p>

      {removeTarget && <ConfirmDialog title="Delete guest meal?" message={`Delete the guest meal record for ${removeTarget.guestName}? This will also update the meal-rate and member-cost calculations.`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setRemoveTarget(null)} />}
    </section>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>{children}</label>
}

function NumberField({ label, value, onChange }) {
  return <Field label={label}><input type="number" min="0" max="50" step="1" required className="input" value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>
}
