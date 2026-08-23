'use client'

import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Clock,
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
        attendedTitle: 'Events Already Attended',
        accept: 'Accept',
        decline: 'Decline',
        cancel: 'Cancel RSVP',
        penaltyWarning:
          'Canceling less than 24h before the event incurs a $2,000 COP penalty to your debt balance.',
        accepted: 'Attending',
        attended: 'Attended',
        swipeHint: 'Swipe for more events →',
        noUpcoming: 'No upcoming events right now.',
        noAttended: 'No past attended events.',
        location: 'Location',
      },
      es: {
        title: 'Próximos Eventos',
        attendedTitle: 'Eventos Ya Asistidos',
        accept: 'Aceptar',
        decline: 'Rechazar',
        cancel: 'Cancelar Asistencia',
        penaltyWarning:
          'Cancelar a menos de 24h del evento genera una multa de $2,000 COP en tu saldo.',
        accepted: 'Asistiendo',
        attended: 'Asististe',
        swipeHint: 'Desliza para ver más →',
        noUpcoming: 'No hay eventos próximos en este momento.',
        noAttended: 'No tienes eventos asistidos pasados.',
        location: 'Ubicación',
      },
    }[lang] || {
      title: 'Próximos Eventos',
      attendedTitle: 'Eventos Ya Asistidos',
      accept: 'Aceptar',
      decline: 'Rechazar',
      cancel: 'Cancelar Asistencia',
      penaltyWarning:
        'Cancelar a menos de 24h del evento genera una multa de $2,000 COP.',
      accepted: 'Asistiendo',
      attended: 'Asististe',
      swipeHint: 'Desliza para ver más →',
      noUpcoming: 'No hay eventos próximos.',
      noAttended: 'No hay eventos asistidos.',
      location: 'Ubicación',
    }

  const now = new Date()

  // 1. Upcoming events: event_date is now or in the future
  const upcomingInvs = invitations.filter((inv: any) => {
    if (!inv.events) return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const isFuture = eventDate.getTime() >= now.getTime() - 1000 * 60 * 60 * 12 // up to 12h after start still active

    if (!isFuture) return false
    return inv.status === 'pending' || inv.status === 'accepted'
  })

  // 2. Attended events: past events where the user accepted/attended
  const attendedInvs = invitations.filter((inv: any) => {
    if (!inv.events) return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const isPast = eventDate.getTime() < now.getTime() - 1000 * 60 * 60 * 12

    return isPast && inv.status === 'accepted'
  })

  if (upcomingInvs.length === 0 && attendedInvs.length === 0) {
    return (
      <div
        id="events-section"
        className="glass-panel rounded-[24px] p-4 sm:p-5 shadow-lg border border-white/10 flex items-center justify-between gap-3 mb-6 scroll-mt-20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-100">{t.title}</h3>
            <p className="text-xs text-zinc-400">
              {lang === 'es'
                ? 'No tienes invitaciones a eventos pendientes.'
                : 'No pending event invitations.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-6">
      {/* 1. UPCOMING EVENTS CAROUSEL (Only upcoming events) */}
      {upcomingInvs.length > 0 && (
        <details
          id="events-section"
          open
          className="group/events glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10"
        >
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-100 text-shadow-sm flex items-center gap-2">
                  {t.title}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30">
                    {upcomingInvs.length}
                  </span>
                </h2>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-zinc-400 group-open/events:rotate-180 transition-transform duration-300" />
          </summary>

          {/* Swipe Hint on Mobile */}
          {upcomingInvs.length > 1 && (
            <div className="sm:hidden flex items-center justify-end pb-2">
              <span className="text-[10px] text-fuchsia-300/80 font-bold uppercase tracking-wider">
                {t.swipeHint}
              </span>
            </div>
          )}

          {/* Horizontal Snap Carousel */}
          <div className="snap-carousel gap-4 pb-3 pt-1">
            {upcomingInvs.map((inv: any) => {
              const evt = inv.events
              const isAccepted = inv.status === 'accepted'
              const eventDate = new Date(evt.event_date)
              const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
              const isNear = diffHours >= 0 && diffHours < 48

              return (
                <div
                  key={inv.id}
                  className={`w-[290px] sm:w-[320px] shrink-0 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                    isAccepted
                      ? 'bg-fuchsia-950/20 border-fuchsia-500/40'
                      : 'bg-black/45 border-white/15'
                  }`}
                >
                  {/* Poster Image */}
                  {evt.poster_url ? (
                    <div
                      onClick={() => setSelectedImage(evt.poster_url)}
                      className="h-36 sm:h-40 w-full relative overflow-hidden cursor-pointer group bg-black shrink-0"
                    >
                      <img
                        src={evt.poster_url}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 right-2.5 text-[9px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-zinc-300 border border-white/10 font-bold">
                        🔍 Tap image
                      </span>
                    </div>
                  ) : (
                    <div className="h-20 w-full bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 flex items-center justify-center border-b border-white/10 shrink-0">
                      <Calendar className="w-8 h-8 text-fuchsia-400/40" />
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-black text-sm sm:text-base text-zinc-100 line-clamp-2 leading-snug">
                          {evt.title}
                        </h3>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border shrink-0 ${
                            isAccepted
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isAccepted ? t.accepted : inv.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-zinc-300">
                        <p className="flex items-center gap-1.5 font-semibold text-fuchsia-300">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {eventDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            ·{' '}
                            {eventDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                        {evt.location && (
                          <p className="flex items-center gap-1.5 text-zinc-400 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            <span className="truncate">{evt.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-white/10">
                      {!isAccepted ? (
                        <div className="flex gap-2">
                          <form action={safeRsvp} className="flex-1">
                            <input type="hidden" name="invId" value={inv.id} />
                            <input type="hidden" name="status" value="accepted" />
                            <SubmitButton
                              loadingText=".."
                              className="w-full py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md shadow-fuchsia-600/20 touch-feedback"
                            >
                              <Check className="w-3.5 h-3.5" /> {t.accept}
                            </SubmitButton>
                          </form>
                          <form action={safeRsvp} className="flex-1">
                            <input type="hidden" name="invId" value={inv.id} />
                            <input type="hidden" name="status" value="declined" />
                            <SubmitButton
                              loadingText=".."
                              className="w-full py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 touch-feedback"
                            >
                              <X className="w-3.5 h-3.5" /> {t.decline}
                            </SubmitButton>
                          </form>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <form action={safeRsvp}>
                            <input type="hidden" name="invId" value={inv.id} />
                            <input type="hidden" name="status" value="declined" />
                            <SubmitButton
                              loadingText="Canceling..."
                              className="w-full py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-feedback"
                            >
                              <X className="w-3.5 h-3.5" /> {t.cancel}
                            </SubmitButton>
                          </form>
                          {isNear && (
                            <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 leading-tight">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {t.penaltyWarning}
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
        </details>
      )}

      {/* 2. DEDICATED ATTENDED EVENTS SECTION (Separate from upcoming) */}
      {attendedInvs.length > 0 && (
        <details className="group/attended glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-100 text-shadow-sm flex items-center gap-2">
                  {t.attendedTitle}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {attendedInvs.length}
                  </span>
                </h2>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-zinc-400 group-open/attended:rotate-180 transition-transform duration-300" />
          </summary>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {attendedInvs.map((inv: any) => {
              const evt = inv.events
              const eventDate = new Date(evt.event_date)

              return (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 hover:border-emerald-500/30 transition-all"
                >
                  {evt.poster_url ? (
                    <div
                      onClick={() => setSelectedImage(evt.poster_url)}
                      className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer relative shrink-0 border border-white/10 group"
                    >
                      <img
                        src={evt.poster_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-zinc-100 text-xs sm:text-sm truncate">
                        {evt.title}
                      </h4>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        {t.attended}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {eventDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {evt.location && (
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {evt.location}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {/* Image Modal for Full View */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-xl w-full max-h-[85vh] rounded-3xl overflow-hidden glass-panel-heavy p-2 animate-spring-scale border border-white/20">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Event Poster"
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
