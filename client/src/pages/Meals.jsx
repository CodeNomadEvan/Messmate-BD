import { useEffect, useState } from 'react'
import { ArrowRight, Check, Clock3, X } from 'lucide-react'
import { getMess, updateMess } from '../api/messService'
import { getMessUsers } from '../api/memberService'
import { createMealRequest, getMeal, getPendingRequests, getRequestForMember, saveMeal, updateRequestStatus } from '../api/mealService'
import { formatDate, formatTime, monthEnd, monthLabel, monthStart, toISO, timeToMinutes, currentMinutes } from '../lib/date'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const SLOTS = [
  { key: 'breakfast', short: 'B', label: 'Breakfast' },
  { key: 'lunch', short: 'L', label: 'Lunch' },
  { key: 'dinner', short: 'D', label: 'Dinner' },
]

export default function Meals() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState([])
  const [mess, setMess] = useState(null)
  const [selectedDate, setSelectedDate] = useState(toISO())
  const [selectedMember, setSelectedMember] = useState(user?.role === 'Manager' ? '' : user?.id || '')
  const [meals, setMeals] = useState({ breakfast: true, lunch: true, dinner: true })
  const [requests, setRequests] = useState([])
  const [requestAction, setRequestAction] = useState('OFF')
  const [requestStart, setRequestStart] = useState(toISO())
  const [requestEnd, setRequestEnd] = useState(toISO())
  const [requestSlots, setRequestSlots] = useState({ breakfast: true, lunch: false, dinner: false })
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [deadline, setDeadline] = useState('20:00')
  const [loading, setLoading] = useState(false)

  const canManage = user?.role === 'Manager'
  const closedToday = currentMinutes() >= timeToMinutes(deadline)

  useEffect(() => {
    loadPage()
  }, [user?.messId, user?.id])

  useEffect(() => {
    loadMeal()
  }, [selectedMember, selectedDate, user?.messId])

  async function loadPage() {
    if (!user?.messId) return

    try {
      const [nextMembers, nextMess] = await Promise.all([
        getMessUsers(),
        getMess(),
      ])

      setMembers(nextMembers)
      setMess(nextMess)
      setDeadline(nextMess.cancellationDeadline || '20:00')

      if (user.role === 'Member') {
        setSelectedMember(user.id)
      }

      await loadRequests()
    } catch {
      setMembers([])
      setRequests([])
    }
  }

  async function loadMeal() {
    if (!selectedMember || !user?.messId) return

    try {
      const meal = await getMeal(selectedMember, selectedDate)
      setMeals(meal)
    } catch {
      setMeals({ breakfast: true, lunch: true, dinner: true })
    }
  }

  async function loadRequests() {
    try {
      const nextRequests = canManage ? await getPendingRequests() : await getRequestForMember()
      setRequests(nextRequests)
    } catch {
      setRequests([])
    }
  }

  async function handleManagerMealChange(slot) {
    const next = { ...meals, [slot]: !meals[slot] }
    setMeals(next)

    try {
      await saveMeal(selectedMember, selectedDate, next)
      toast(`${slot[0].toUpperCase() + slot.slice(1)} updated.`)
    } catch (error) {
      setMeals(meals)
      toast(error.response?.data?.message || 'Could not update the meal.', 'warning')
    }
  }

  async function handleDeadlineSave() {
    if (!deadline) return

    try {
      const nextMess = await updateMess({ cancellationDeadline: deadline })
      setMess(nextMess)
      setMessage(`Same-day cancellation deadline is now ${formatTime(deadline)}.`)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not update the deadline.', 'warning')
    }
  }

  function toggleRequestSlot(slot) {
    setRequestSlots((current) => ({ ...current, [slot]: !current[slot] }))
  }

  async function submitRequest() {
    const slots = SLOTS.filter((slot) => requestSlots[slot.key]).map((slot) => slot.key)

    if (requestAction === 'OFF' && requestEnd < requestStart) {
      setMessage('End date must be on or after the start date.')
      return
    }

    setLoading(true)
    const result = await createMealRequest({
      action: requestAction,
      startDate: requestStart,
      endDate: requestAction === 'OFF' ? requestEnd : null,
      slots,
      reason: requestAction === 'OFF' ? reason : '',
    })
    setLoading(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setMessage(`${requestAction === 'OFF' ? 'Meal OFF' : 'Meal ON'} request sent to the Manager.`)
    setReason('')
    setRequestEnd(requestStart)
    await loadRequests()
  }

  async function reviewRequest(id, status) {
    const result = await updateRequestStatus(id, status)

    if (!result.ok) {
      toast(result.error, 'warning')
      return
    }

    await loadRequests()
    await loadMeal()
    toast(status === 'Approved' ? 'Request approved.' : 'Request rejected.')
  }

  const selectedName = members.find((member) => member.id === selectedMember)?.name || user?.name
  const isMember = user?.role === 'Member'
  const today = toISO()
  const deadlineApplies = requestStart <= today && (requestAction === 'OFF' ? requestEnd >= today : requestStart === today)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div><p className="text-xs text-[#1A6B3C] font-display font-700 uppercase tracking-wide">{monthLabel()}</p><h1 className="text-2xl font-display font-900 text-[#1C2B2B] mt-1">Meal Management</h1><p className="text-sm text-[#6B7878] mt-0.5">{canManage ? 'Record daily meals and review member requests.' : 'View your meals and request changes from the Manager.'}</p></div>
        {canManage && <div className="flex items-center gap-2 bg-white border border-[#E3DED6] rounded-[9px] px-3 py-2"><Clock3 size={15} className="text-[#1A6B3C]" /><span className="text-xs text-[#6B7878]">Deadline</span><input type="time" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="text-sm font-mono outline-none" /><button onClick={handleDeadlineSave} className="text-xs text-[#1A6B3C] font-display font-700">Save</button></div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr] gap-4">
        <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div><h2 className="font-display font-800 text-[#1C2B2B]">Daily meal calendar</h2><p className="text-xs text-[#6B7878] mt-1">{selectedName} · {formatDate(selectedDate, true)}</p></div>
            <div className="flex gap-2"><input type="date" value={selectedDate} min={monthStart()} max={monthEnd()} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 rounded-[8px] border border-[#E3DED6] bg-[#F7F5F0] text-sm" />{canManage && <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="px-3 py-2 rounded-[8px] border border-[#E3DED6] bg-[#F7F5F0] text-sm"><option value="">Select member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>}</div>
          </div>

          {!selectedMember ? <div className="py-12 text-center text-sm text-[#6B7878]">Select a member to record meals.</div> : (
            <div className="grid grid-cols-3 gap-3">
              {SLOTS.map((slot) => {
                const on = meals[slot.key]
                return <button key={slot.key} disabled={!canManage} onClick={() => handleManagerMealChange(slot.key)} className={`text-left p-4 rounded-[10px] border ${on ? 'bg-[#E6F3EC] border-[#1A6B3C]/20' : 'bg-[#FEF2F2] border-[#DC2626]/15'} ${canManage ? 'cursor-pointer' : 'cursor-default'}`}><div className="flex items-center justify-between"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-800 ${on ? 'bg-[#1A6B3C] text-white' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>{slot.short}</span>{on ? <Check size={15} className="text-[#1A6B3C]" /> : <X size={15} className="text-[#DC2626]" />}</div><p className="text-sm font-display font-800 text-[#1C2B2B] mt-4">{slot.label}</p><p className="text-xs text-[#6B7878] mt-1">{on ? 'Meal is ON' : 'Meal is OFF'}</p></button>
              })}
            </div>
          )}
          {!canManage && <div className="mt-4 rounded-[9px] bg-[#F7F5F0] p-3 text-xs text-[#6B7878]">Members cannot directly change meal records. Use the request form below and the Manager will review it.</div>}
        </div>

        <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
          <h2 className="font-display font-800 text-[#1C2B2B]">Today’s cancellation</h2>
          <div className={`mt-4 rounded-[10px] p-4 ${closedToday ? 'bg-[#FEF2F2]' : 'bg-[#E6F3EC]'}`}><p className="text-xs text-[#6B7878]">Same-day OFF deadline</p><p className={`font-mono text-2xl mt-1 ${closedToday ? 'text-[#DC2626]' : 'text-[#1A6B3C]'}`}>{formatTime(deadline)}</p><p className="text-xs text-[#6B7878] mt-2">{closedToday ? 'Today’s cancellation window is closed.' : 'Members can still request today’s meal off.'}</p></div>
          {isMember && <div className="mt-4 flex gap-2"><button onClick={() => setRequestAction('OFF')} className={`flex-1 py-2.5 rounded-[8px] text-xs font-display font-700 border ${requestAction === 'OFF' ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-white text-[#78350F] border-[#E8C47A]'}`}>Request OFF</button><button onClick={() => setRequestAction('ON')} className={`flex-1 py-2.5 rounded-[8px] text-xs font-display font-700 border ${requestAction === 'ON' ? 'bg-[#1A6B3C] text-white border-[#1A6B3C]' : 'bg-white text-[#1A6B3C] border-[#A9D7BB]'}`}>Request ON</button></div>}
        </div>
      </div>

      {isMember && <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="font-display font-800 text-[#1C2B2B]">Request Meal {requestAction === 'OFF' ? 'OFF' : 'ON'}</h2><p className="text-xs text-[#6B7878] mt-1">{requestAction === 'OFF' ? 'Choose one or more days and meal slots. The Manager must approve.' : 'Choose the date your selected meals should resume. No end date or reason is needed.'}</p></div><ArrowRight size={16} className="text-[#6B7878]" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <Field label={requestAction === 'ON' ? 'Resume date' : 'Start date'}><input type="date" value={requestStart} min={toISO()} max={monthEnd()} onChange={(e) => setRequestStart(e.target.value)} className="input" /></Field>
          {requestAction === 'OFF' && <Field label="End date"><input type="date" value={requestEnd} min={requestStart || toISO()} max={monthEnd()} onChange={(e) => setRequestEnd(e.target.value)} className="input" /></Field>}
        </div>

        <div className="mt-4"><p className="text-xs text-[#6B7878] font-display font-700 mb-2">Meals</p><div className="grid grid-cols-3 gap-2">{SLOTS.map((slot) => <button key={slot.key} type="button" onClick={() => toggleRequestSlot(slot.key)} className={`py-2.5 rounded-[8px] border text-xs font-display font-700 ${requestSlots[slot.key] ? 'bg-[#E6F3EC] border-[#1A6B3C]/25 text-[#1A6B3C]' : 'bg-white border-[#E3DED6] text-[#6B7878]'}`}>{slot.label}</button>)}</div></div>

        {requestAction === 'OFF' && <Field label="Reason (optional)"><textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input mt-1" rows="2" placeholder="Optional note for the Manager" /></Field>}
        {requestAction === 'OFF' && deadlineApplies && closedToday && <p className="mt-3 text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2">Today’s cancellation window is closed. You can still request a future date.</p>}
        {message && <p className="mt-3 text-xs text-[#1A6B3C] bg-[#E6F3EC] border border-[#B9DEC8] rounded-[8px] px-3 py-2">{message}</p>}
        <button onClick={submitRequest} disabled={loading || (requestAction === 'OFF' && deadlineApplies && closedToday)} className={`mt-4 px-4 py-2.5 rounded-[8px] text-sm font-display font-700 text-white disabled:opacity-50 ${requestAction === 'OFF' ? 'bg-[#D97706]' : 'bg-[#1A6B3C]'}`}>{loading ? 'Sending…' : 'Send Request'}</button>
      </div>}

      <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4"><div><h2 className="font-display font-800 text-[#1C2B2B]">{canManage ? 'Pending requests' : 'Your request history'}</h2><p className="text-xs text-[#6B7878] mt-1">{canManage ? 'Review member meal changes before they affect the calendar.' : 'Requests stay visible here with their current status.'}</p></div></div>
        {requests.length === 0 ? <div className="py-8 text-center text-sm text-[#6B7878]">{canManage ? 'No pending requests.' : 'No requests yet.'}</div> : <div className="space-y-3">{requests.map((request) => <RequestRow key={request.id} request={request} canManage={canManage} onReview={reviewRequest} />)}</div>}
      </div>
    </div>
  )
}

function RequestRow({ request, canManage, onReview }) {
  const slotText = request.slots.map((slot) => ({ breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }[slot])).join(', ')
  return <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-[10px] bg-[#F7F5F0]"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-display font-800 text-[#1C2B2B]">{request.memberName}</p><span className={`text-[10px] px-2 py-1 rounded-full font-display font-700 ${request.action === 'OFF' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#E6F3EC] text-[#1A6B3C]'}`}>{request.action}</span><span className="text-[10px] px-2 py-1 rounded-full bg-white border border-[#E3DED6] text-[#6B7878]">{request.status}</span></div><p className="text-xs text-[#6B7878] mt-1">{formatDate(request.startDate)}{request.endDate ? ` → ${formatDate(request.endDate)}` : ''} · {slotText}</p>{request.reason && <p className="text-xs text-[#6B7878] mt-1">Reason: {request.reason}</p>}</div>{canManage && <div className="flex gap-2"><button onClick={() => onReview(request.id, 'Approved')} className="px-3 py-2 rounded-[8px] bg-[#1A6B3C] text-white text-xs font-display font-700">Approve</button><button onClick={() => onReview(request.id, 'Rejected')} className="px-3 py-2 rounded-[8px] bg-[#FEF2F2] text-[#DC2626] text-xs font-display font-700">Reject</button></div>}</div>
}

function Field({ label, children }) {
  return <label className="block mt-4"><span className="text-xs text-[#6B7878] font-display font-700 block mb-1.5">{label}</span>{children}</label>
}
