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
  Mail,
  Sparkles,
} from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { rsvpEvent } from '@/app/dashboard/actions'

export function EventInvitationsClient({
  invitations,
  lang = 'es',
}: {
  invitations: any
  lang?: 'en' | 'es'
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const safeRsvp = async (formData: FormData) => {
    await rsvpEvent(formData)
  }

  const t =
    {
      en: {
        eventsTabTitle: 'Community Events',
        pendingTitle: 'Pending Invitations',
        upcomingTitle: 'Confirmed Upcoming Events',
        attendedTitle: 'Completed / Attended Events',
        accept: 'Accept',
        decline: 'Decline',
        cancel: 'Cancel RSVP',
        penaltyWarning:
          'Canceling less than 24h before the event incurs a $2,000 COP penalty to your debt balance.',
        accepted: 'Attending',
        attended: 'Attended',
        swipeHint: 'Swipe for more →',
        noEvents: 'No events or invitations at the moment.',
        location: 'Location',
      },
      es: {
        eventsTabTitle: 'Eventos de la Comunidad',
        pendingTitle: 'Invitaciones Pendientes',
        upcomingTitle: 'Próximos Eventos Confirmados',
        attendedTitle: 'Eventos Completados / Asistidos',
        accept: 'Aceptar',
        decline: 'Rechazar',
        cancel: 'Cancelar Asistencia',
        penaltyWarning:
          'Cancelar a menos de 24h del evento genera una multa de $2,000 COP.',
        accepted: 'Asistiendo',
        attended: 'Asististe',
        swipeHint: 'Desliza para ver más →',
        noEvents: 'No tienes eventos ni invitaciones pendientes en este momento.',
        location: 'Ubicación',
      },
    }[lang] || {
      eventsTabTitle: 'Eventos de la Comunidad',
      pendingTitle: 'Invitaciones Pendientes',
      upcomingTitle: 'Próximos Eventos Confirmados',
      attendedTitle: 'Eventos Completados / Asistidos',
      accept: 'Aceptar',
      decline: 'Rechazar',
      cancel: 'Cancelar Asistencia',
      penaltyWarning:
        'Cancelar a menos de 24h del evento genera una multa de $2,000 COP.',
      accepted: 'Asistiendo',
      attended: 'Asististe',
      swipeHint: 'Desliza para ver más →',
      noEvents: 'No tienes eventos ni invitaciones pendientes.',
      location: 'Ubicación',
    }

  const now = new Date()
  const allInvs = invitations || []

  // 1. Pending Invitations: future events where user has not accepted/declined yet
  const pendingInvs = allInvs.filter((inv: any) => {
    if (!inv.events) return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const isFuture = eventDate.getTime() >= now.getTime() - 1000 * 60 * 60 * 12
    return isFuture && inv.status === 'pending'
  })

  // 2. Confirmed Upcoming: future events where user already accepted
  const confirmedUpcoming = allInvs.filter((inv: any) => {
    if (!inv.events) return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const isFuture = eventDate.getTime() >= now.getTime() - 1000 * 60 * 60 * 12
    return isFuture && inv.status === 'accepted'
  })

  // 3. Attended / Completed Events: past accepted events
  const attendedInvs = allInvs.filter((inv: any) => {
    if (!inv.events) return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const isPast = eventDate.getTime() < now.getTime() - 1000 * 60 * 60 * 12
    return isPast && inv.status === 'accepted'
  })

  const totalEventsCount = pendingInvs.length + confirmedUpcoming.length + attendedInvs.length

  if (totalEventsCount === 0) {
    return (
      <div
        id="events-section"
        className="glass-panel rounded-[28px] p-5 sm:p-6 shadow-lg border border-white/10 flex items-center justify-between gap-3 scroll-mt-24"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-zinc-100">{t.eventsTabTitle}</h3>
            <p className="text-xs text-zinc-400">{t.noEvents}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="events-section" className="space-y-4 scroll-mt-24">
      {/* 1. PENDING INVITATIONS (POR CONFIRMAR) */}
      {pendingInvs.length > 0 && (
        <details
          open
          className="group/pending glass-panel-heavy rounded-[28px] p-5 sm:p-6 shadow-xl border border-amber-500/30 bg-amber-950/10"
        >
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                  {t.pendingTitle}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 shadow-sm animate-pulse">
                    {pendingInvs.length}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'es'
                    ? 'Confirma tu asistencia para asegurar tu cupo'
                    : 'Confirm your attendance to reserve your spot'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-zinc-400 group-open/pending:rotate-180 transition-transform duration-300" />
          </summary>

          <div className="space-y-3 pt-2">
            {pendingInvs.map((inv: any) => {
              const evt = inv.events
              const eventDate = new Date(evt.event_date)

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    {evt.poster_url && (
                      <div
                        onClick={() => setSelectedImage(evt.poster_url)}
                        className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer relative shrink-0 border border-white/15 bg-black"
                      >
                        <img
                          src={evt.poster_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-sm text-zinc-100">{evt.title}</h4>
                      <p className="text-xs text-amber-300/90 flex items-center gap-1 mt-0.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
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
                      </p>
                      {evt.location && (
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {evt.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                    <form action={safeRsvp} className="flex-1 sm:flex-initial">
                      <input type="hidden" name="invId" value={inv.id} />
                      <input type="hidden" name="status" value="accepted" />
                      <SubmitButton
                        loadingText=".."
                        className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md touch-feedback cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> {t.accept}
                      </SubmitButton>
                    </form>

                    <form action={safeRsvp} className="flex-1 sm:flex-initial">
                      <input type="hidden" name="invId" value={inv.id} />
                      <input type="hidden" name="status" value="declined" />
                      <SubmitButton
                        loadingText=".."
                        className="w-full px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 touch-feedback cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> {t.decline}
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {/* 2. CONFIRMED UPCOMING EVENTS */}
      {confirmedUpcoming.length > 0 && (
        <details
          open
          className="group/upcoming glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10"
        >
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                  {t.upcomingTitle}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30">
                    {confirmedUpcoming.length}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'es'
                    ? 'Eventos a los que confirmaste tu asistencia'
                    : 'Events you are confirmed to attend'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-zinc-400 group-open/upcoming:rotate-180 transition-transform duration-300" />
          </summary>

          {confirmedUpcoming.length > 1 && (
            <div className="sm:hidden flex items-center justify-end pb-2">
              <span className="text-[10px] text-fuchsia-300/80 font-bold uppercase tracking-wider">
                {t.swipeHint}
              </span>
            </div>
          )}

          <div className="snap-carousel gap-4 pb-3 pt-1">
            {confirmedUpcoming.map((inv: any) => {
              const evt = inv.events
              const eventDate = new Date(evt.event_date)
              const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
              const isNear = diffHours >= 0 && diffHours < 48

              return (
                <div
                  key={inv.id}
                  className="w-[290px] sm:w-[320px] shrink-0 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-lg bg-fuchsia-950/20 border-fuchsia-500/40"
                >
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
                        🔍 Ver poster
                      </span>
                    </div>
                  ) : (
                    <div className="h-20 w-full bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 flex items-center justify-center border-b border-white/10 shrink-0">
                      <Calendar className="w-8 h-8 text-fuchsia-400/40" />
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-black text-sm sm:text-base text-zinc-100 line-clamp-2 leading-snug">
                          {evt.title}
                        </h3>
                        <span className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border bg-purple-500/20 text-purple-300 border-purple-500/40 shrink-0">
                          {t.accepted}
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

                    <div className="pt-2 border-t border-white/10">
                      <form action={safeRsvp}>
                        <input type="hidden" name="invId" value={inv.id} />
                        <input type="hidden" name="status" value="declined" />
                        <SubmitButton
                          loadingText="Canceling..."
                          className="w-full py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-feedback cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> {t.cancel}
                        </SubmitButton>
                      </form>
                      {isNear && (
                        <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 leading-tight mt-1.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {t.penaltyWarning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {/* 3. COMPLETED / ATTENDED EVENTS */}
      {attendedInvs.length > 0 && (
        <details className="group/attended glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                  {t.attendedTitle}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {attendedInvs.length}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'es'
                    ? 'Historial de eventos a los que asististe'
                    : 'Past events you attended'}
                </p>
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
                      className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer relative shrink-0 border border-white/10 group bg-black"
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full max-h-[85vh] rounded-3xl overflow-hidden glass-panel-heavy p-2 animate-spring-scale border border-white/20"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
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
