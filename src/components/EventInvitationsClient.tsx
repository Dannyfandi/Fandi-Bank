'use client'

import { Calendar, MapPin, Check, X, AlertTriangle, Info } from 'lucide-react'
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
      accept: 'Accept RSVP',
      decline: 'Decline',
      cancel: 'Cancel RSVP',
      penaltyWarning: 'Canceling less than 24h before the event incurs a $2,000 COP penalty to your debt balance.',
      accepted: 'You are going!',
    },
    es: {
      title: 'Próximos Eventos',
      accept: 'Aceptar RSVP',
      decline: 'Rechazar',
      cancel: 'Cancelar RSVP',
      penaltyWarning: 'Cancelar a menos de 24h del evento genera una multa de $2,000 COP en tu saldo.',
      accepted: '¡Vas a asistir!',
    }
  }[lang] || { title: 'Upcoming Events', accept: 'Accept RSVP', decline: 'Decline', cancel: 'Cancel RSVP', penaltyWarning: 'Canceling less than 24h before the event incurs a $2k COP penalty.', accepted: 'You are going!' }

  // Only show pending or accepted
  const activeInvs = invitations.filter((inv: any) => inv.status === 'pending' || inv.status === 'accepted')

  if (activeInvs.length === 0) return null

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl sm:text-2xl font-black text-fuchsia-400 flex items-center gap-2">
        <Calendar className="w-6 h-6" /> {t.title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeInvs.map((inv: any) => {
          const evt = inv.events
          const eventDate = new Date(evt.event_date)
          const now = new Date()
          const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          const isLateCancel = diffHours >= 0 && diffHours < 24

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
                         <span className="text-emerald-400 font-black flex items-center gap-1 text-sm"><Check className="w-4 h-4" /> {t.accepted}</span>
                         <form action={safeRsvp}>
                           <input type="hidden" name="invitationId" value={inv.id} />
                           <input type="hidden" name="status" value="declined" />
                           <SubmitButton loadingText="Canceling..." className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${isLateCancel ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-red-400'}`}>
                              {t.cancel}
                           </SubmitButton>
                         </form>
                      </div>
                      {isLateCancel && (
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
    </div>
  )
}
