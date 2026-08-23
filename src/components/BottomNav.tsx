'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Gamepad2,
  ShoppingBag,
  Ticket,
  Landmark,
  MapPin,
  Calculator,
  CalendarPlus,
  Lightbulb,
} from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { TicketRequestForm } from './TicketRequestForm'
import { LoanRequestForm } from './LoanRequestForm'
import { VisitForm } from './VisitForm'
import { LoanSimulator } from './LoanSimulator'
import { SuggestEventForm } from './SuggestEventForm'
import { SuggestForm } from './SuggestForm'

interface BottomNavProps {
  role?: string
  lang?: 'en' | 'es'
  hasEvents?: boolean
  friendsList?: any[]
}

export function BottomNav({
  role,
  lang = 'es',
  hasEvents = false,
  friendsList = [],
}: BottomNavProps) {
  const pathname = usePathname()
  const [activeSheet, setActiveSheet] = useState<
    'none' | 'actions' | 'ticket' | 'loan' | 'visit' | 'simulator' | 'suggestEvent' | 'suggestIdea'
  >('none')
  const [activeSection, setActiveSection] = useState<'debts' | 'events' | 'games' | 'shop'>('debts')

  const t = {
    en: {
      dashboard: 'Home',
      events: 'Events',
      actions: 'Actions',
      games: 'Games',
      shop: 'Shop',
      quickActions: 'Quick Actions',
      requestTicket: 'Request Ticket',
      requestLoan: 'Request Loan',
      scheduleVisit: 'Schedule Visit',
      loanSimulator: 'Loan Simulator',
      suggestEvent: 'Suggest Event',
      suggestIdea: 'Suggest Idea',
    },
    es: {
      dashboard: 'Inicio',
      events: 'Eventos',
      actions: 'Acciones',
      games: 'Juegos',
      shop: 'Tienda',
      quickActions: 'Acciones Rápidas',
      requestTicket: 'Pedir Entrada',
      requestLoan: 'Pedir Préstamo',
      scheduleVisit: 'Visita Casa',
      loanSimulator: 'Simulador',
      suggestEvent: 'Sugerir Evento',
      suggestIdea: 'Sugerir Idea',
    },
  }[lang] || {
    dashboard: 'Inicio',
    events: 'Eventos',
    actions: 'Acciones',
    games: 'Juegos',
    shop: 'Tienda',
    quickActions: 'Acciones Rápidas',
    requestTicket: 'Pedir Entrada',
    requestLoan: 'Pedir Préstamo',
    scheduleVisit: 'Visita Casa',
    loanSimulator: 'Simulador',
    suggestEvent: 'Sugerir Evento',
    suggestIdea: 'Sugerir Idea',
  }

  // Scroll Spy: Tracks user scroll position and highlights active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180
      const shopEl = document.getElementById('shop-section')
      const gamesEl = document.getElementById('games-section')
      const eventsEl = document.getElementById('events-section')

      if (shopEl && scrollPos >= shopEl.offsetTop - 80) {
        setActiveSection('shop')
      } else if (gamesEl && scrollPos >= gamesEl.offsetTop - 80) {
        setActiveSection('games')
      } else if (
        eventsEl &&
        scrollPos >= eventsEl.offsetTop - 80 &&
        scrollPos < (gamesEl ? gamesEl.offsetTop - 80 : Infinity)
      ) {
        setActiveSection('events')
      } else {
        setActiveSection('debts')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    if (pathname !== '/dashboard' && pathname !== '/') {
      window.location.href = `/dashboard#${id}`
      return
    }

    if (id === 'debts-section' || id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveSection('debts')
      return
    }

    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (id === 'events-section') setActiveSection('events')
      if (id === 'games-section') setActiveSection('games')
      if (id === 'shop-section') setActiveSection('shop')
    }
  }

  return (
    <>
      {/* Mobile Fixed Frosted-Glass Bottom Navigation Bar (5-Column Centered Grid) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/85 backdrop-blur-2xl border-t border-white/15 px-2 py-2 pb-5 shadow-2xl">
        <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
          {/* 1. Home / Debts */}
          <button
            onClick={() => scrollToSection('debts-section')}
            className={`w-full flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl touch-feedback transition-colors ${
              activeSection === 'debts'
                ? 'text-purple-400 font-bold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight truncate max-w-full">{t.dashboard}</span>
          </button>

          {/* 2. Events */}
          <button
            onClick={() => scrollToSection('events-section')}
            className={`w-full flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl touch-feedback transition-colors relative ${
              activeSection === 'events'
                ? 'text-fuchsia-400 font-bold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight truncate max-w-full">{t.events}</span>
            {hasEvents && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
            )}
          </button>

          {/* 3. Center Quick Action Trigger */}
          <button
            onClick={() => setActiveSheet('actions')}
            className="flex items-center justify-center -mt-6 w-13 h-13 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 border-2 border-white/40 touch-feedback cursor-pointer animate-pulse"
            aria-label={t.actions}
          >
            <Sparkles className="w-6 h-6" />
          </button>

          {/* 4. Games & Themes */}
          <button
            onClick={() => scrollToSection('games-section')}
            className={`w-full flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl touch-feedback transition-colors ${
              activeSection === 'games'
                ? 'text-yellow-400 font-bold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gamepad2 className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight truncate max-w-full">{t.games}</span>
          </button>

          {/* 5. Shop (Happy Shop & Rewards) */}
          <button
            onClick={() => scrollToSection('shop-section')}
            className={`w-full flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl touch-feedback transition-colors ${
              activeSection === 'shop'
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight truncate max-w-full">{t.shop}</span>
          </button>
        </div>
      </nav>

      {/* Quick Actions Central Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'actions'}
        onClose={() => setActiveSheet('none')}
        title={t.quickActions}
        icon={<Sparkles className="w-5 h-5 text-purple-400" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Suggest Event */}
          <button
            onClick={() => setActiveSheet('suggestEvent')}
            className="p-3.5 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex flex-col items-center text-center gap-1.5 hover:bg-fuchsia-500/25 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.suggestEvent}</span>
          </button>

          {/* Request Ticket */}
          <button
            onClick={() => setActiveSheet('ticket')}
            className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col items-center text-center gap-1.5 hover:bg-purple-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.requestTicket}</span>
          </button>

          {/* Request Loan */}
          <button
            onClick={() => setActiveSheet('loan')}
            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center text-center gap-1.5 hover:bg-amber-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.requestLoan}</span>
          </button>

          {/* Schedule Visit */}
          <button
            onClick={() => setActiveSheet('visit')}
            className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex flex-col items-center text-center gap-1.5 hover:bg-pink-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.scheduleVisit}</span>
          </button>

          {/* Loan Simulator */}
          <button
            onClick={() => setActiveSheet('simulator')}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center text-center gap-1.5 hover:bg-emerald-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.loanSimulator}</span>
          </button>

          {/* Suggest Idea */}
          <button
            onClick={() => setActiveSheet('suggestIdea')}
            className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex flex-col items-center text-center gap-1.5 hover:bg-blue-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.suggestIdea}</span>
          </button>
        </div>
      </BottomSheet>

      {/* Suggest Event Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'suggestEvent'}
        onClose={() => setActiveSheet('none')}
        title={t.suggestEvent}
        icon={<CalendarPlus className="w-5 h-5 text-fuchsia-400" />}
      >
        <SuggestEventForm friends={friendsList} onSuccess={() => setActiveSheet('none')} />
      </BottomSheet>

      {/* Suggest Idea Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'suggestIdea'}
        onClose={() => setActiveSheet('none')}
        title={t.suggestIdea}
        icon={<Lightbulb className="w-5 h-5 text-blue-400" />}
      >
        <SuggestForm />
      </BottomSheet>

      {/* Individual Form Bottom Sheets */}
      <BottomSheet
        isOpen={activeSheet === 'ticket'}
        onClose={() => setActiveSheet('none')}
        title={t.requestTicket}
        icon={<Ticket className="w-5 h-5 text-purple-400" />}
      >
        <TicketRequestForm />
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'loan'}
        onClose={() => setActiveSheet('none')}
        title={t.requestLoan}
        icon={<Landmark className="w-5 h-5 text-amber-400" />}
      >
        <LoanRequestForm />
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'visit'}
        onClose={() => setActiveSheet('none')}
        title={t.scheduleVisit}
        icon={<MapPin className="w-5 h-5 text-fuchsia-400" />}
      >
        <VisitForm />
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'simulator'}
        onClose={() => setActiveSheet('none')}
        title={t.loanSimulator}
        icon={<Calculator className="w-5 h-5 text-emerald-400" />}
      >
        <LoanSimulator lang={lang} />
      </BottomSheet>
    </>
  )
}
