'use client'

import { useState } from 'react'
import { Ticket, Landmark, MapPin, Calculator, Sparkles } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { TicketRequestForm } from './TicketRequestForm'
import { LoanRequestForm } from './LoanRequestForm'
import { VisitForm } from './VisitForm'
import { LoanSimulator } from './LoanSimulator'

interface QuickActionGridProps {
  lang: 'en' | 'es'
  t: {
    actions: string
    requestTicket: string
    descTicket: string
    requestLoan: string
    descLoan: string
    visits: string
    scheduleVisit: string
  }
}

export function QuickActionGrid({ lang, t }: QuickActionGridProps) {
  const [activeModal, setActiveModal] = useState<
    'none' | 'ticket' | 'loan' | 'visit' | 'simulator'
  >('none')

  const simTitle = lang === 'es' ? 'Simulador de Préstamo' : 'Loan Simulator'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-zinc-100 text-shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {t.actions}
        </h2>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Ticket Request Card */}
        <button
          onClick={() => setActiveModal('ticket')}
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel hover:bg-white/5 border border-purple-500/20 text-left transition-all touch-feedback group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm sm:text-base leading-tight mb-1">
            {t.requestTicket}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {t.descTicket}
          </p>
        </button>

        {/* Loan Request Card */}
        <button
          onClick={() => setActiveModal('loan')}
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel hover:bg-white/5 border border-amber-500/20 text-left transition-all touch-feedback group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm sm:text-base leading-tight mb-1">
            {t.requestLoan}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {t.descLoan}
          </p>
        </button>

        {/* Visit Request Card */}
        <button
          onClick={() => setActiveModal('visit')}
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel hover:bg-white/5 border border-fuchsia-500/20 text-left transition-all touch-feedback group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm sm:text-base leading-tight mb-1">
            {t.visits}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {t.scheduleVisit}
          </p>
        </button>

        {/* Loan Simulator Card */}
        <button
          onClick={() => setActiveModal('simulator')}
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel hover:bg-white/5 border border-emerald-500/20 text-left transition-all touch-feedback group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100 text-sm sm:text-base leading-tight mb-1">
            {simTitle}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {lang === 'es' ? 'Calcula intereses antes de solicitar.' : 'Calculate interest before applying.'}
          </p>
        </button>
      </div>

      {/* Slide-up Bottom Sheets */}
      <BottomSheet
        isOpen={activeModal === 'ticket'}
        onClose={() => setActiveModal('none')}
        title={t.requestTicket}
        icon={<Ticket className="w-5 h-5 text-purple-400" />}
      >
        <TicketRequestForm />
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'loan'}
        onClose={() => setActiveModal('none')}
        title={t.requestLoan}
        icon={<Landmark className="w-5 h-5 text-amber-400" />}
      >
        <LoanRequestForm />
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'visit'}
        onClose={() => setActiveModal('none')}
        title={t.visits}
        icon={<MapPin className="w-5 h-5 text-fuchsia-400" />}
      >
        <VisitForm />
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'simulator'}
        onClose={() => setActiveModal('none')}
        title={simTitle}
        icon={<Calculator className="w-5 h-5 text-emerald-400" />}
      >
        <LoanSimulator lang={lang} />
      </BottomSheet>
    </div>
  )
}
