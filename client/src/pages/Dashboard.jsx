import { useEffect, useState } from 'react'
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMess } from '../api/messService'
import { getMessUsers } from '../api/memberService'
import { getMealsForRange, getPendingRequests } from '../api/mealService'
import { formatLongDate, formatTime, monthEnd, monthStart, toISO, timeToMinutes, currentMinutes } from '../lib/date'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [pending, setPending] = useState([])
  const [mess, setMess] = useState(null)
  const [todayMeals, setTodayMeals] = useState([])
  const [monthMeals, setMonthMeals] = useState([])
  const today = toISO()

  useEffect(() => {
    load()
  }, [user?.messId])

  async function load() {
    if (!user?.messId) return

    try {
      const [nextMess, nextMembers, nextPending, nextTodayMeals, nextMonthMeals] = await Promise.all([
        getMess(),
        getMessUsers(),
        user.role === 'Manager' ? getPendingRequests() : Promise.resolve([]),
        getMealsForRange(today, today),
        getMealsForRange(monthStart(), monthEnd(), user.role === 'Member' ? user.id : undefined),
      ])

      setMess(nextMess)
      setMembers(nextMembers)
      setPending(nextPending)
      setTodayMeals(nextTodayMeals)
      setMonthMeals(nextMonthMeals)
    } catch {
      setMembers([])
      setPending([])
      setTodayMeals([])
      setMonthMeals([])
    }
  }

  const deadline = mess?.cancellationDeadline || '20:00'
  const closed = currentMinutes() >= timeToMinutes(deadline)

  const todayMealByMember = new Map(todayMeals.map((meal) => [meal.memberId, meal]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs text-[#1A6B3C] font-display font-700 uppercase tracking-wide">{formatLongDate(today)}</p>
          <h1 className="text-3xl font-display font-900 text-[#1C2B2B] mt-1">{user?.role === 'Manager' ? 'Mess overview' : `Hi, ${user?.name}`}</h1>
          <p className="text-sm text-[#6B7878] mt-1">{user?.messName} · {user?.area}</p>
        </div>
        <div className="flex gap-2"><Link to="/members" className="px-4 py-2 rounded-[8px] bg-white border border-[#E3DED6] text-sm font-display font-700 text-[#1C2B2B]">Members</Link><Link to="/meals" className="px-4 py-2 rounded-[8px] bg-[#1A6B3C] text-white text-sm font-display font-700">Meals</Link></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members" value={members.length} />
        <StatCard label="Managers" value={members.filter((member) => member.role === 'Manager').length} />
        <StatCard label="Pending requests" value={pending.length} />
        <StatCard label="Cancellation" value={formatTime(deadline)} />
      </div>

      <div className={`rounded-[12px] border p-5 ${closed ? 'bg-[#FEF2F2] border-[#FECACA]' : 'bg-white border-[#E3DED6]'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center ${closed ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#E6F3EC] text-[#1A6B3C]'}`}><CalendarClock size={18} /></div>
          <div className="flex-1"><p className="font-display font-800 text-[#1C2B2B]">Meal cancellation timeline</p><p className="text-sm text-[#6B7878] mt-1">Same-day meal OFF requests are accepted until <span className="font-display font-700 text-[#1C2B2B]">{formatTime(deadline)}</span>.</p></div>
          <span className={`text-xs font-display font-700 px-2 py-1 rounded-full ${closed ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#E6F3EC] text-[#1A6B3C]'}`}>{closed ? 'Closed for today' : 'Open today'}</span>
        </div>
      </div>

      {user?.role === 'Manager' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4"><h2 className="font-display font-800 text-[#1C2B2B]">Today’s meals</h2><Link to="/meals" className="text-xs text-[#1A6B3C] font-display font-700 flex items-center gap-1">Open meals <ArrowRight size={12} /></Link></div>
          {members.length === 0 ? <Empty text="No members yet." /> : <div className="space-y-2">{members.map((member) => { const meal = todayMealByMember.get(member.id) || { breakfast: true, lunch: true, dinner: true }; return <div key={member.id} className="flex items-center justify-between py-2 border-b border-[#F2EFE9] last:border-0"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#E6F3EC] text-[#1A6B3C] flex items-center justify-center text-xs font-display font-700">{member.name?.[0]?.toUpperCase()}</div><span className="text-sm font-display font-600">{member.name}</span></div><div className="flex gap-1">{['breakfast', 'lunch', 'dinner'].map((slot) => <span key={slot} className={`text-[9px] px-1.5 py-1 rounded-full ${meal[slot] ? 'bg-[#E6F3EC] text-[#1A6B3C]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>{slot[0].toUpperCase()}</span>)}</div></div>})}</div>}
        </div>

        <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4"><h2 className="font-display font-800 text-[#1C2B2B]">Pending meal requests</h2><Link to="/meals" className="text-xs text-[#1A6B3C] font-display font-700 flex items-center gap-1">Review <ArrowRight size={12} /></Link></div>
          {pending.length === 0 ? <Empty text="No pending requests." /> : <div className="space-y-3">{pending.slice(0, 5).map((request) => <div key={request.id} className="p-3 rounded-[10px] bg-[#F7F5F0]"><div className="flex items-center justify-between"><p className="text-sm font-display font-700 text-[#1C2B2B]">{request.memberName}</p><span className={`text-[10px] px-2 py-1 rounded-full font-display font-700 ${request.action === 'OFF' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#E6F3EC] text-[#1A6B3C]'}`}>{request.action}</span></div><p className="text-xs text-[#6B7878] mt-1">{request.startDate}{request.endDate ? ` → ${request.endDate}` : ''}</p></div>)}</div>}
        </div>
      </div>}

      {user?.role === 'Member' && <div className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm"><div className="flex items-center gap-2 mb-4"><Clock3 size={17} className="text-[#1A6B3C]" /><h2 className="font-display font-800 text-[#1C2B2B]">Your month at a glance</h2></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><MiniStat label="Breakfast" value={countSlot(monthMeals, user.id, 'breakfast')} /><MiniStat label="Lunch" value={countSlot(monthMeals, user.id, 'lunch')} /><MiniStat label="Dinner" value={countSlot(monthMeals, user.id, 'dinner')} /></div></div>}

      
    </div>
  )
}

function countSlot(meals, memberId, slot) {
  return meals
    .filter((meal) => meal.memberId === memberId)
    .reduce((total, meal) => total + Number(meal[slot]), 0)
}

function StatCard({ label, value }) {
  return <div className="bg-white rounded-[12px] border border-[#E3DED6] p-4 shadow-sm"><p className="text-xs text-[#6B7878] mb-1">{label}</p><p className="font-mono text-xl text-[#1C2B2B]">{value}</p></div>
}

function MiniStat({ label, value }) {
  return <div className="bg-[#F7F5F0] rounded-[9px] p-3"><p className="text-xs text-[#6B7878]">{label}</p><p className="font-mono text-xl mt-1 text-[#1C2B2B]">{value}</p></div>
}

function Empty({ text }) {
  return <div className="text-center py-7"><Users size={18} className="mx-auto text-[#C8C4BC]" /><p className="text-sm text-[#6B7878] mt-2">{text}</p></div>
}
