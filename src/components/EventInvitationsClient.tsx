'use client'

import { Calendar, MapPin, Check, X, AlertTriangle, Info, ChevronDown } from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { rsvpEvent } from '@/app/dashboard/actions'

export function EventInvitationsClient({ invitations, lang }: { invitations: any, lang: 'en' | 'es' }) {
  if (!invitations || invitations.length === 0) return null

  const safeRsvp = async (formData: FormData) => {
    await rsvpEvent(formData)
  }

  const t = {
    en: {
      title: 'Upcoming Events',
      accept: 'Accept Invitation',
      decline: 'Decline',
      cancel: 'Cancel Attendance',
      penaltyWarning: 'Canceling less than 24h before the event incurs a $2,000 COP penalty to your debt balance.',
      accepted: 'You are attending!',
      attended: 'You attended!',
    },
    es: {
      title: 'Próximos Eventos',
      accept: 'Aceptar Invitación',
      decline: 'Rechazar',
      cancel: 'Cancelar Asistencia',
      penaltyWarning: 'Cancelar a menos de 24h del evento genera una multa de $2,000 COP en tu saldo.',
      accepted: '¡Vas a asistir!',
      attended: '¡Asististe!',
    }
  }[lang] || { title: 'Upcoming Events', accept: 'Accept Invitation', decline: 'Decline', cancel: 'Cancel Attendance', penaltyWarning: 'Canceling less than 24h before the event incurs a $2k COP penalty.', accepted: 'You are attending!' }

  const now = new Date()

  // Only show pending or accepted, AND filter out past pending events
  const activeInvs = invitations.filter((inv: any) => {
    if (inv.status !== 'pending' && inv.status !== 'accepted') return false
    const evt = inv.events
    const eventDate = new Date(evt.event_date)
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    // Hide if event date has passed and it's pending
    if (diffHours < 0 && inv.status === 'pending') return false
    return true
  })

  if (activeInvs.length === 0) return null

  return (
    <details open className="group/events mb-6">
      <summary className="cursor-pointer list-none flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-500" />
        <h2 className="text-xl sm:text-2xl font-bold">{t.title}</h2>
        <span className="text-xs text-zinc-500 font-bold ml-1">({activeInvs.length})</span>
        <ChevronDown className="w-4 h-4 text-zinc-500 ml-auto group-open/events:rotate-180 transition-transform" />
      </summary>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {activeInvs.map((inv: any) => {
          const evt = inv.events
          const eventDate = new Date(evt.event_date)
          const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          
          // Late cancel warning
          const isLateCancel = diffHours >= 0 && diffHours < 24
          
          // If event has passed by more than 24 hours (1 day)
          const isPastEvent = diffHours <= -24

          return (
            <div key={inv.id} className={`relative overflow-hidden rounded-3xl border shadow-xl flex flex-col ${inv.status === 'accepted' ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-fuchsia-500/30 bg-zinc-900/40 backdrop-blur-[40px]'}`}>
              {evt.poster_url && (
                <div className="h-32 w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                  <img src={evt.poster_url} className="w-full h-full object-cover" alt="Event cover" />
                  <div className="absolute bottom-3 left-4 z-20">
                     <h3 className="font-black text-xl text-white drop-shadow-md">{evt.title}</h3>
                  </div>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                {!evt.poster_url && (
                  <h3 className="font-black text-xl text-white mb-2">{evt.title}</h3>
                )}
                
                <div className="space-y-1.5 flex-1">
                  <p className="text-sm text-zinc-300 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-fuchsia-400"/> {eventDate.toLocaleString()}</p>
                  <p className="text-sm text-zinc-300 font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-fuchsia-400"/> {evt.location}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  {inv.status === 'pending' ? (
                    <div className="flex gap-2">
                       <form action={safeRsvp} className="flex-1">
                         <input type="hidden" name="invitationId" value={inv.id} />
                         <input type="hidden" name="status" value="accepted" />
                         <SubmitButton className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold uppercase tracking-widest transition-all">
                           <Check className="w-4 h-4 inline mr-1" /> {t.accept}
                         </SubmitButton>
                       </form>
                       <form action={safeRsvp}>
                         <input type="hidden" name="invitationId" value={inv.id} />
                         <input type="hidden" name="status" value="declined" />
                         <SubmitButton className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all">
                           <X className="w-4 h-4" />
                         </SubmitButton>
                       </form>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-emerald-400 font-black flex items-center gap-1 text-sm"><Check className="w-4 h-4" /> {isPastEvent ? t.attended : t.accepted}</span>
                         {!isPastEvent && (
                           <form action={safeRsvp}>
                             <input type="hidden" name="invitationId" value={inv.id} />
                             <input type="hidden" name="status" value="declined" />
                             <SubmitButton loadingText="Canceling..." className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${isLateCancel ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-red-400'}`}>
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
    </details>
  )
}
