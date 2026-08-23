'use client'

import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { rsvpEvent } from '@/app/dashboard/actions'

export function EventInvitationsClient({
  invitations,
  lang,
}: {
  invitations: any
  lang: 'en' | 'es'
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  if (!invitations || invitations.length === 0) return null

  const safeRsvp = async (formData: FormData) => {
    await rsvpEvent(formData)
  }

  const t =
    {
      en: {
        title: 'Upcoming Events',
        accept: 'Accept',
        decline: 'Decline',
        cancel: 'Cancel RSVP',
        penaltyWarning:
          'Canceling less than 24h before the event incurs a $2,000 COP penalty to your debt balance.',
        accepted: 'Attending',
        attended: 'Attended',
        swipeHint: 'Swipe to see more events →',
      },
      es: {
        title: 'Próximos Eventos',
        accept: 'Aceptar',
        decline: 'Rechazar',
        cancel: 'Cancelar Asistencia',
        penaltyWarning:
          'Cancelar a menos de 24h del evento genera una multa de $2,000 COP en tu saldo.',
        accepted: 'Asistiendo',
        attended: 'Asististe',
        swipeHint: 'Desliza para ver más eventos →',
      },
    }[lang] || {
      title: 'Próximos Eventos',
      accept: 'Aceptar',
      decline: 'Rechazar',
      cancel: 'Cancelar Asistencia',
      penaltyWarning:
        'Cancelar a menos de 24h del evento genera una multa de $2,000 COP.',
      accepted: 'Asistiendo',
      attended: 'Asististe',
      swipeHint: 'Desliza para ver más →',
    }

  const now = new Date()

  // Only show pending or accepted, AND filter out past pending events
  const activeInvs = invitations.filter((inv: any) => {
    if (inv.status !== 'pending' && inv.status !== 'accepted') return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours <= -24 && inv.status === 'pending') return false
    return true
  })

  if (activeInvs.length === 0) return null

  return (
    <details id="events-section" open className="group/events glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10 mb-6">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-100 text-shadow-sm flex items-center gap-2">
              {t.title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold">
                {activeInvs.length}
              </span>
            </h2>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-zinc-400 group-open/events:rotate-180 transition-transform duration-300" />
      </summary>

      {/* Horizontal Swipeable Carousel for Events */}
      <div className="mt-2 relative">
        <div className="snap-carousel gap-4 pb-2 pt-1">
          {activeInvs.map((inv: any) => {
            const evt = inv.events
            const eventDate = new Date(evt.event_date)
            const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
            const isLateCancel = diffHours >= 0 && diffHours < 24
            const isPastEvent = diffHours <= -24

            return (
              <div
                key={inv.id}
                className={`w-[290px] sm:w-[320px] shrink-0 rounded-2xl overflow-hidden border shadow-lg flex flex-col justify-between transition-all ${
                  inv.status === 'accepted'
                    ? 'border-emerald-500/35 bg-emerald-950/20'
                    : 'border-fuchsia-500/30 bg-black/45'
                }`}
              >
                {evt.poster_url && (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(evt.poster_url)}
                    className="h-36 w-full overflow-hidden relative group/poster focus:outline-none cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                    <img
                      src={evt.poster_url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
                      alt={evt.title}
                    />
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 z-20">
                      <h3 className="font-black text-base text-white text-shadow-md truncate">
                        {evt.title}
                      </h3>
                    </div>
                  </button>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  {!evt.poster_url && (
                    <h3 className="font-black text-base text-white text-shadow-sm truncate">
                      {evt.title}
                    </h3>
                  )}

                  <div className="space-y-1.5 text-xs text-zinc-300 font-medium">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                      <span className="truncate">{eventDate.toLocaleString()}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    {inv.status === 'pending' ? (
                      <div className="flex gap-2">
                        <form action={safeRsvp} className="flex-1">
                          <input type="hidden" name="invitationId" value={inv.id} />
                          <input type="hidden" name="status" value="accepted" />
                          <SubmitButton className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all touch-feedback flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {t.accept}
                          </SubmitButton>
                        </form>
                        <form action={safeRsvp}>
                          <input type="hidden" name="invitationId" value={inv.id} />
                          <input type="hidden" name="status" value="declined" />
                          <SubmitButton className="px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-xl text-xs font-bold transition-all touch-feedback">
                            <X className="w-3.5 h-3.5" />
                          </SubmitButton>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-black flex items-center gap-1 text-xs">
                            <Check className="w-3.5 h-3.5" /> {isPastEvent ? t.attended : t.accepted}
                          </span>
                          {!isPastEvent && (
                            <form action={safeRsvp}>
                              <input type="hidden" name="invitationId" value={inv.id} />
                              <input type="hidden" name="status" value="declined" />
                              <SubmitButton
                                loadingText="Canceling..."
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all touch-feedback ${
                                  isLateCancel
                                    ? 'bg-red-500 text-white'
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-red-400'
                                }`}
                              >
                                {t.cancel}
                              </SubmitButton>
                            </form>
                          )}
                        </div>
                        {isLateCancel && !isPastEvent && (
                          <p className="text-[10px] text-red-400 leading-snug font-bold border border-red-500/30 bg-red-500/10 p-2 rounded-lg flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {t.penaltyWarning}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {activeInvs.length > 1 && (
          <p className="text-[11px] text-zinc-500 font-semibold text-right pt-1 pr-1 sm:hidden">
            {t.swipeHint}
          </p>
        )}
      </div>

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-spring-scale"
              alt="Event poster full size"
            />
          </div>
        </div>
      )}
    </details>
  )
}
