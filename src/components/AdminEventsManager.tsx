'use client'

import { useState } from 'react'
import { Calendar, Users, MapPin, Image as ImageIcon, Plus, X, Map } from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { createEvent } from '@/app/admin/actions'

export function AdminEventsManager({ users, events, invitations }: any) {
  const [showForm, setShowForm] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
  }

  // Pre-process events
  const enrichedEvents = events.map((e: any) => {
    const invs = invitations.filter((i: any) => i.event_id === e.id)
    return { ...e, invitations: invs }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-fuchsia-900/20 p-4 rounded-2xl border border-fuchsia-500/30">
        <h3 className="text-base sm:text-lg font-bold text-fuchsia-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-fuchsia-400" /> Event Manager
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
          {showForm ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {showForm && (
        <form action={createEvent} className="p-5 sm:p-6 border border-fuchsia-500/20 rounded-2xl sm:rounded-3xl bg-zinc-900/80 backdrop-blur-[40px] shadow-2xl relative overflow-hidden space-y-4 animate-in slide-in-from-top-4 duration-300">
          <input type="hidden" name="userIds" value={JSON.stringify(selectedUsers)} />
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Event Name</label>
              <input name="title" type="text" required placeholder="e.g. Mojo Dojo Party" className="mt-1 w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-inner" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Date</label>
                <input name="date" type="date" required className="mt-1 w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Time</label>
                <input name="time" type="time" required className="mt-1 w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-inner" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</label>
              <input name="location" type="text" defaultValue="Mojo Dojo Casa House" className="mt-1 w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-fuchsia-500 disabled:opacity-50 transition-all shadow-inner" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Poster Image URL (Optional)</label>
              <input name="poster" type="url" placeholder="https://..." className="mt-1 w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-fuchsia-500 transition-all shadow-inner" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1 mt-2 mb-2"><Users className="w-3 h-3"/> Invite Users ({selectedUsers.length} selected)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {users.map((u: any) => (
                  <button
                    key={u.id} type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border text-left truncate ${selectedUsers.includes(u.id) ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300' : 'bg-black/30 border-white/5 text-zinc-500 hover:border-white/20'}`}
                  >
                    {u.username || u.email}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <SubmitButton loadingText="Creating..." className="w-full mt-4 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(192,38,211,0.3)]">
            Create Event
          </SubmitButton>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {enrichedEvents.length === 0 && <p className="text-zinc-500 text-sm">No upcoming events.</p>}
        {enrichedEvents.map((evt: any) => (
          <div key={evt.id} className="p-4 border border-white/10 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] flex flex-col sm:flex-row gap-4">
            {evt.poster_url ? (
              <img src={evt.poster_url} className="w-full sm:w-32 h-32 object-cover rounded-xl shrink-0 border border-white/10" alt="Poster" />
            ) : (
              <div className="w-full sm:w-32 h-32 bg-black/50 rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                <Map className="w-8 h-8 text-zinc-700" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-black text-fuchsia-300 truncate">{evt.title}</h4>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> {new Date(evt.event_date).toLocaleString()}</p>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> {evt.location}</p>
              
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">Invitations ({evt.invitations.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {evt.invitations.map((inv: any) => {
                    const statusColor = inv.status === 'accepted' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : inv.status === 'declined' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    const u = users.find((x:any) => x.id === inv.user_id)
                    return (
                       <span key={inv.id} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                         {u?.username || 'User'}: {inv.status}
                       </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
