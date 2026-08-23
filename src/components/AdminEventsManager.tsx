'use client'

import { useState } from 'react'
import {
  Calendar,
  Users,
  MapPin,
  Image as ImageIcon,
  Plus,
  X,
  Map,
  Trash2,
  Edit2,
  ChevronDown,
} from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { createEvent, deleteEvent, updateEvent } from '@/app/admin/actions'

export function AdminEventsManager({ users, events, invitations }: any) {
  const [showForm, setShowForm] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }

  const enrichedEvents = events.map((e: any) => {
    const invs = invitations.filter((i: any) => i.event_id === e.id)
    return { ...e, invitations: invs }
  })

  return (
    <details className="space-y-4 group/adminevents glass-panel rounded-[28px] p-4 sm:p-6 border border-white/10 shadow-xl">
      <summary className="cursor-pointer list-none flex justify-between items-center select-none">
        <h3 className="text-base sm:text-lg font-black text-fuchsia-200 flex items-center gap-2.5 text-shadow-sm">
          <Calendar className="w-5 h-5 text-fuchsia-400" /> Event Manager
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30">
            {events.length}
          </span>
        </h3>
        <div className="flex items-center gap-3">
          <ChevronDown className="w-5 h-5 text-zinc-400 group-open/adminevents:rotate-180 transition-transform duration-300" />
        </div>
      </summary>

      <div className="pt-3 space-y-4">
        {/* Create Event Form */}
        {showForm && !editingEventId && (
          <form
            action={async (fd) => {
              await createEvent(fd)
              setShowForm(false)
            }}
            encType="multipart/form-data"
            className="p-5 sm:p-6 border border-fuchsia-500/30 rounded-3xl bg-black/60 shadow-2xl relative overflow-hidden space-y-4 animate-spring-scale"
          >
            <input type="hidden" name="userIds" value={JSON.stringify(selectedUsers)} />
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                  Event Name
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Mojo Dojo Party"
                  className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full px-3 py-2.5 glass-input rounded-2xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                    Time
                  </label>
                  <input
                    name="time"
                    type="time"
                    required
                    className="w-full px-3 py-2.5 glass-input rounded-2xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <input
                    name="location"
                    type="text"
                    defaultValue="Mojo Dojo Casa House"
                    className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs sm:text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1 mb-1">
                    <ImageIcon className="w-3 h-3" /> Poster Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="posterFile"
                    className="w-full px-3 py-2 glass-input rounded-2xl text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-black file:bg-fuchsia-500/20 file:text-fuchsia-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1 mt-2 mb-2">
                  <Users className="w-3 h-3" /> Invite Users ({selectedUsers.length}{' '}
                  selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {users.map((u: any) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left truncate touch-feedback ${
                        selectedUsers.includes(u.id)
                          ? 'bg-fuchsia-500/25 border-fuchsia-500/60 text-fuchsia-200'
                          : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      {u.username || u.email}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <SubmitButton
              loadingText="Creating..."
              className="w-full mt-3 py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black tracking-wider uppercase text-xs rounded-2xl transition-all shadow-lg shadow-fuchsia-600/30 touch-feedback"
            >
              Create Event
            </SubmitButton>
          </form>
        )}

        {/* Events List */}
        <div className="space-y-3">
          {enrichedEvents.length === 0 && (
            <p className="text-zinc-500 text-xs py-4 text-center">No upcoming events.</p>
          )}
          {enrichedEvents.map((evt: any) => {
            if (editingEventId === evt.id) {
              const eventDateObj = new Date(evt.event_date)
              const localObj = new Date(
                eventDateObj.getTime() - 5 * 60 * 60 * 1000
              )
              const dateOnly = localObj.toISOString().split('T')[0]
              const timeOnly = localObj.toISOString().split('T')[1].slice(0, 5)

              return (
                <form
                  key={evt.id}
                  action={async (fd) => {
                    await updateEvent(fd)
                    setEditingEventId(null)
                  }}
                  encType="multipart/form-data"
                  className="p-5 border border-emerald-500/30 rounded-3xl bg-black/60 shadow-2xl space-y-4 animate-spring-scale"
                >
                  <input type="hidden" name="eventId" value={evt.id} />
                  <input
                    type="hidden"
                    name="userIds"
                    value={JSON.stringify(selectedUsers)}
                  />
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-emerald-400 font-bold text-sm">Edit Event</h4>
                    <button
                      type="button"
                      onClick={() => setEditingEventId(null)}
                      className="p-1 hover:bg-white/10 rounded-lg text-zinc-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                        Title
                      </label>
                      <input
                        name="title"
                        type="text"
                        defaultValue={evt.title}
                        required
                        className="w-full px-4 py-2.5 glass-input rounded-2xl text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                          Date
                        </label>
                        <input
                          name="date"
                          type="date"
                          defaultValue={dateOnly}
                          required
                          className="w-full px-3 py-2 glass-input rounded-2xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                          Time
                        </label>
                        <input
                          name="time"
                          type="time"
                          defaultValue={timeOnly}
                          required
                          className="w-full px-3 py-2 glass-input rounded-2xl text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                          Location
                        </label>
                        <input
                          name="location"
                          type="text"
                          defaultValue={evt.location}
                          className="w-full px-4 py-2 glass-input rounded-2xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">
                          New Poster
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          name="posterFile"
                          className="w-full px-3 py-1.5 glass-input rounded-2xl text-xs text-white file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:bg-emerald-500/20 file:text-emerald-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1 mb-2">
                        <Users className="w-3 h-3" /> Update Users ({selectedUsers.length}{' '}
                        selected)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                        {users.map((u: any) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleUser(u.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left truncate touch-feedback ${
                              selectedUsers.includes(u.id)
                                ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-200'
                                : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'
                            }`}
                          >
                            {u.username || u.email}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <SubmitButton
                    loadingText="Saving..."
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black tracking-wider uppercase text-xs rounded-2xl transition-all touch-feedback shadow-lg shadow-emerald-600/25"
                  >
                    Save Changes
                  </SubmitButton>
                </form>
              )
            }

            return (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-black/45 border border-white/10 flex flex-col sm:flex-row gap-4 relative group hover:border-fuchsia-500/30 transition-all shadow-md"
              >
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingEventId(evt.id)
                      setShowForm(false)
                      setSelectedUsers(evt.invitations.map((inv: any) => inv.user_id))
                    }}
                    className="p-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 rounded-xl transition-colors border border-emerald-500/30 touch-feedback"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <form action={deleteEvent}>
                    <input type="hidden" name="eventId" value={evt.id} />
                    <SubmitButton className="p-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-xl transition-colors border border-red-500/30 touch-feedback">
                      <Trash2 className="w-3.5 h-3.5" />
                    </SubmitButton>
                  </form>
                </div>

                {evt.poster_url ? (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(evt.poster_url)}
                    className="w-full sm:w-28 h-28 relative group/poster focus:outline-none cursor-pointer shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-md"
                  >
                    <img
                      src={evt.poster_url}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/poster:scale-105"
                      alt="Poster"
                    />
                  </button>
                ) : (
                  <div className="w-full sm:w-28 h-28 bg-black/50 rounded-2xl flex items-center justify-center border border-white/5 shrink-0">
                    <Map className="w-7 h-7 text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0 pr-14 sm:pr-16">
                  <h4 className="text-base font-black text-fuchsia-300 truncate">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />{' '}
                    {new Date(evt.event_date).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {evt.location}
                  </p>

                  <div className="mt-2.5">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">
                      Invitations ({evt.invitations.length})
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {evt.invitations.map((inv: any) => {
                        const statusColor =
                          inv.status === 'accepted'
                            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                            : inv.status === 'declined'
                            ? 'text-red-300 bg-red-500/15 border-red-500/30'
                            : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                        const u = users.find((x: any) => x.id === inv.user_id)
                        return (
                          <span
                            key={inv.id}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}
                          >
                            {u?.username || 'User'}: {inv.status}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Full-size Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-2xl w-full max-h-[85vh] glass-panel-heavy rounded-3xl p-2 flex items-center justify-center border border-white/20">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2.5 text-white bg-black/70 hover:bg-black rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedImage}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                alt="Full size event poster"
              />
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
