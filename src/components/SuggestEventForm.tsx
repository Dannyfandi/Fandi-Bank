'use client'

import { useState } from 'react'
import {
  Calendar,
  CalendarPlus,
  Users,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { suggestUserEvent } from '@/app/dashboard/actions'

const TIME_SLOTS = [
  { id: 'morning', label: '🌅 Mañana / Mediodía (8am - 1pm)' },
  { id: 'afternoon', label: '☀️ Tarde (1pm - 6pm)' },
  { id: 'night', label: '🌙 Noche (6pm en adelante)' },
]

export function SuggestEventForm({
  friends = [],
  onSuccess,
}: {
  friends?: any[]
  onSuccess?: () => void
}) {
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single')
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['afternoon'])
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const toggleSlot = (id: string) => {
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    try {
      const fd = new FormData(e.currentTarget)
      fd.set('dateMode', dateMode)
      selectedSlots.forEach((slot) => fd.append('timeSlots', slot))
      selectedFriends.forEach((f) => fd.append('invitedUsers', f))

      const res = await suggestUserEvent(fd)
      if (res.success) {
        setMsg({ type: 'success', text: res.message })
        if (onSuccess) {
          setTimeout(onSuccess, 1500)
        }
      } else {
        setMsg({ type: 'error', text: res.message || 'Error al enviar sugerencia' })
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Error inesperado' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100">
      {/* Title */}
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
          Nombre del Evento <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="Ej: Salida a comer alitas, Mirador, Película..."
          className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
        />
      </div>

      {/* Estimated Price */}
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
          Precio Estimado por Persona / Total (COP) <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            name="price"
            required
            placeholder="Ej: 25000"
            className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Date Type Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
          Fecha Sugerida (Opcional)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDateMode('single')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              dateMode === 'single'
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
          >
            Fecha Específica
          </button>
          <button
            type="button"
            onClick={() => setDateMode('range')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              dateMode === 'range'
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
          >
            Rango de Fechas
          </button>
        </div>

        {dateMode === 'single' ? (
          <input
            type="date"
            name="dateSingle"
            className="w-full p-3 glass-input rounded-2xl text-xs sm:text-sm text-zinc-100"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              name="dateStart"
              placeholder="Desde"
              className="w-full p-2.5 glass-input rounded-2xl text-xs text-zinc-100"
            />
            <input
              type="date"
              name="dateEnd"
              placeholder="Hasta"
              className="w-full p-2.5 glass-input rounded-2xl text-xs text-zinc-100"
            />
          </div>
        )}
      </div>

      {/* Multi-select Time Slots */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
          Rango de Horarios (Puedes seleccionar varios)
        </label>
        <div className="space-y-1.5">
          {TIME_SLOTS.map((slot) => {
            const isChecked = selectedSlots.includes(slot.id)
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleSlot(slot.id)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors touch-feedback ${
                  isChecked
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <span>{slot.label}</span>
                {isChecked && <CheckCircle className="w-4 h-4 text-purple-400" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Location (Optional) */}
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
          Lugar / Ubicación (Opcional)
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-fuchsia-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="location"
            placeholder="Ej: C.C. Santafé, Casa de Danny..."
            className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Photo URL (Optional) */}
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
          Foto / Poster URL (Opcional)
        </label>
        <div className="relative">
          <ImageIcon className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            name="photoUrl"
            placeholder="https://..."
            className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Invite Friends */}
      {friends.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Invitar Amigos ({selectedFriends.length} seleccionados)
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 glass-panel rounded-2xl">
            {friends.map((f) => {
              const isSelected = selectedFriends.includes(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFriend(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-feedback ${
                    isSelected
                      ? 'bg-fuchsia-500 text-white shadow-md'
                      : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                  }`}
                >
                  {f.username}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {msg && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-spring-scale ${
            msg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/80 border-red-500/40 text-red-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 hover:from-fuchsia-400 hover:to-pink-400 text-white font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg shadow-fuchsia-500/30 transition-all flex items-center justify-center gap-2 touch-feedback disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CalendarPlus className="w-4 h-4" />
        )}
        <span>Enviar Sugerencia de Evento</span>
      </button>
    </form>
  )
}
