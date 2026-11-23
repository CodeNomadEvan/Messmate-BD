import { useEffect, useState } from 'react'
import { Calendar, Copy, Phone, Shield, Trash2, User } from 'lucide-react'
import { getMess } from '../api/messService'
import { getMessUsers, removeUser, updateUserRole } from '../api/memberService'
import { getMealsForRange } from '../api/mealService'
import { monthEnd, monthStart } from '../lib/date'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

export default function Members() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState([])
  const [mealCounts, setMealCounts] = useState({})
  const [mess, setMess] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [copied, setCopied] = useState(false)
  const canManage = user?.role === 'Manager'

  useEffect(() => {
    loadMembers()
  }, [user?.messId])

  async function loadMembers() {
    if (!user?.messId) return

    try {
      const [nextMembers, nextMess, meals] = await Promise.all([
        getMessUsers(),
        getMess(),
        getMealsForRange(monthStart(), monthEnd()),
      ])

      setMembers(nextMembers)
      setMess(nextMess)

      const counts = {}
      meals.forEach((meal) => {
        counts[meal.memberId] = (counts[meal.memberId] || 0)
          + Number(meal.breakfast)
          + Number(meal.lunch)
          + Number(meal.dinner)
      })
      setMealCounts(counts)
    } catch {
      setMembers([])
      setMealCounts({})
    }
  }

  async function copyCode() {
    await navigator.clipboard?.writeText(mess?.messCode || '')
    setCopied(true)
    toast('Mess code copied.')
    setTimeout(() => setCopied(false), 1600)
  }

  async function handleRoleChange(member) {
    const managers = members.filter((item) => item.role === 'Manager')

    if (member.id === user.id) {
      toast('You cannot change your own role here.', 'warning')
      return
    }

    if (member.role === 'Manager' && managers.length === 1) {
      toast('Keep at least one manager in the mess.', 'warning')
      return
    }

    const nextRole = member.role === 'Manager' ? 'Member' : 'Manager'

    try {
      await updateUserRole(member.id, nextRole)
      await loadMembers()
      toast(`${member.name} is now a ${nextRole}.`)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not update the role.', 'warning')
    }
  }

  async function handleRemove() {
    if (!removeTarget) return

    if (removeTarget.id === user.id) {
      toast('You cannot remove your own account.', 'warning')
      setRemoveTarget(null)
      return
    }

    const managers = members.filter((item) => item.role === 'Manager')
    if (removeTarget.role === 'Manager' && managers.length === 1) {
      toast('Keep at least one manager in the mess.', 'warning')
      setRemoveTarget(null)
      return
    }

    try {
      await removeUser(removeTarget.id)
      setRemoveTarget(null)
      await loadMembers()
      toast(`${removeTarget.name} removed from the mess.`)
    } catch (error) {
      toast(error.response?.data?.message || 'Could not remove the member.', 'warning')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-800 text-[#1C2B2B]">Member Management</h1>
        <p className="text-[#6B7878] text-sm mt-0.5">{user?.messName} · {members.length} member{members.length === 1 ? '' : 's'}</p>
      </div>

      {canManage && (
        <div className="bg-[#1A6B3C] text-white rounded-[12px] px-5 py-4 flex items-center gap-4">
          <div><p className="text-xs text-green-200">Mess Code — share this with new members</p><p className="font-mono text-2xl font-700 tracking-widest">{mess?.messCode || '—'}</p></div>
          <button onClick={copyCode} className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-[8px] text-sm"> <Copy size={14} /> {copied ? 'Copied' : 'Copy code'}</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Total Members" value={members.length} />
        <Stat label="Managers" value={members.filter((item) => item.role === 'Manager').length} />
        <Stat label="Members" value={members.filter((item) => item.role === 'Member').length} />
      </div>

      {!canManage && (
        <div className="bg-[#EFF6FF] border border-[#3B82F6]/20 rounded-[12px] p-4">
          <p className="text-sm font-display font-700 text-[#1E40AF]">Member access</p>
          <p className="text-xs text-[#475569] mt-1">You can view everyone in the mess. Member management is available only to the Manager.</p>
        </div>
      )}

      {members.length === 0 ? (
        <EmptyState text="No members have joined this mess yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-[12px] border border-[#E3DED6] p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1A6B3C] text-white flex items-center justify-center text-lg font-display font-800">{member.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <p className="font-display font-700 text-[#1C2B2B]">{member.name}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-display font-700 ${member.role === 'Manager' ? 'bg-[#E6F3EC] text-[#1A6B3C]' : 'bg-[#F2EFE9] text-[#6B7878]'}`}>
                      {member.role === 'Manager' ? <Shield size={9} /> : <User size={9} />}{member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#6B7878] mb-3"><Phone size={11} /><span className="font-mono">{member.phone}</span></div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7878]"><Calendar size={11} /><span>Joined account</span></div>

              <div className="mt-4 pt-4 border-t border-[#F2EFE9] grid grid-cols-2 gap-2">
                <div className="bg-[#F7F5F0] rounded-[8px] p-2"><p className="font-mono text-base">{mealCounts[member.id] || 0}</p><p className="text-[10px] text-[#6B7878]">Meals</p></div>
                {canManage ? (
                  <button onClick={() => handleRoleChange(member)} className="rounded-[8px] bg-[#EEF7F2] text-[#1A6B3C] text-xs font-display font-700">{member.role === 'Manager' ? 'Make Member' : 'Make Manager'}</button>
                ) : (
                  <div className="rounded-[8px] bg-[#F7F5F0] flex items-center justify-center"><span className="text-[10px] text-[#A09C94]">View only</span></div>
                )}
              </div>

              {canManage && member.id !== user.id && (
                <button onClick={() => setRemoveTarget(member)} className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-xs text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2]"><Trash2 size={13} /> Remove member</button>
              )}
            </div>
          ))}
        </div>
      )}

      {removeTarget && (
        <ConfirmDialog title="Remove member?" message={`Remove ${removeTarget.name} from this mess?`} confirmLabel="Remove" danger onConfirm={handleRemove} onCancel={() => setRemoveTarget(null)} />
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return <div className="bg-white rounded-[12px] border border-[#E3DED6] p-4 shadow-sm"><p className="text-xs text-[#6B7878] mb-1">{label}</p><p className="font-mono text-xl text-[#1C2B2B]">{value}</p></div>
}

function EmptyState({ text }) {
  return <div className="bg-white border border-dashed border-[#CFC8BE] rounded-[12px] p-10 text-center"><p className="text-sm font-display font-700 text-[#6B7878]">{text}</p><p className="text-xs text-[#A09C94] mt-1">New members will appear here after they join.</p></div>
}
