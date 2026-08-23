'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Gamepad2,
  Users,
  ShieldAlert,
  User,
  Ticket,
  Landmark,
  MapPin,
  Calculator,
} from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { TicketRequestForm } from './TicketRequestForm'
import { LoanRequestForm } from './LoanRequestForm'
import { VisitForm } from './VisitForm'
import { LoanSimulator } from './LoanSimulator'

interface BottomNavProps {
  role?: string
  lang?: 'en' | 'es'
  hasEvents?: boolean
}

export function BottomNav({ role, lang = 'es', hasEvents = false }: BottomNavProps) {
  const pathname = usePathname()
  const [activeSheet, setActiveSheet] = useState<
    'none' | 'actions' | 'ticket' | 'loan' | 'visit' | 'simulator'
  >('none')

  const t = {
    en: {
      dashboard: 'Home',
      events: 'Events',
      actions: 'Actions',
      games: 'Games',
      friends: 'Friends',
      profile: 'Profile',
      admin: 'Admin',
      quickActions: 'Quick Actions',
      requestTicket: 'Request Ticket',
      requestLoan: 'Request Loan',
      scheduleVisit: 'Schedule Visit',
      loanSimulator: 'Loan Simulator',
    },
    es: {
      dashboard: 'Inicio',
      events: 'Eventos',
      actions: 'Acciones',
      games: 'Juegos',
      friends: 'Amigos',
      profile: 'Perfil',
      admin: 'Admin',
      quickActions: 'Acciones Rápidas',
      requestTicket: 'Pedir Entrada',
      requestLoan: 'Pedir Préstamo',
      scheduleVisit: 'Visita Casa',
      loanSimulator: 'Simulador',
    },
  }[lang] || {
    dashboard: 'Inicio',
    events: 'Eventos',
    actions: 'Acciones',
    games: 'Juegos',
    friends: 'Amigos',
    profile: 'Perfil',
    admin: 'Admin',
    quickActions: 'Acciones Rápidas',
    requestTicket: 'Pedir Entrada',
    requestLoan: 'Pedir Préstamo',
    scheduleVisit: 'Visita Casa',
    loanSimulator: 'Simulador',
  }

  const isDashboard = pathname === '/dashboard' || pathname === '/'
  const isFriends = pathname === '/friends'
  const isProfile = pathname === '/profile'
  const isAdmin = pathname.startsWith('/admin')

  const scrollToSection = (id: string) => {
    if (pathname !== '/dashboard' && pathname !== '/admin') {
      window.location.href = `/dashboard#${id}`
      return
    }
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Mobile Fixed Frosted-Glass Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/15 px-3 py-2 pb-5 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home / Dashboard */}
          <Link
            href={role === 'admin' && isAdmin ? '/admin' : '/dashboard'}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl touch-feedback transition-colors ${
              isDashboard || isAdmin
                ? 'text-purple-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.dashboard}</span>
          </Link>

          {/* Events */}
          <button
            onClick={() => scrollToSection('events-section')}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl touch-feedback text-zinc-400 hover:text-zinc-200 transition-colors relative"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.events}</span>
            {hasEvents && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
            )}
          </button>

          {/* Center Quick Action Drawer Trigger */}
          <button
            onClick={() => setActiveSheet('actions')}
            className="flex flex-col items-center justify-center -mt-5 p-3 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white shadow-lg shadow-purple-500/40 border-2 border-white/30 touch-feedback"
            aria-label={t.actions}
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </button>

          {/* Games */}
          <button
            onClick={() => scrollToSection('games-section')}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl touch-feedback text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.games}</span>
          </button>

          {/* Friends */}
          <Link
            href="/friends"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl touch-feedback transition-colors ${
              isFriends
                ? 'text-purple-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{t.friends}</span>
          </Link>
        </div>
      </nav>

      {/* Quick Actions Central Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'actions'}
        onClose={() => setActiveSheet('none')}
        title={t.quickActions}
        icon={<Sparkles className="w-5 h-5 text-purple-400" />}
      >
        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => setActiveSheet('ticket')}
            className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col items-center text-center gap-2 hover:bg-purple-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.requestTicket}</span>
          </button>

          <button
            onClick={() => setActiveSheet('loan')}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center text-center gap-2 hover:bg-amber-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.requestLoan}</span>
          </button>

          <button
            onClick={() => setActiveSheet('visit')}
            className="p-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex flex-col items-center text-center gap-2 hover:bg-fuchsia-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.scheduleVisit}</span>
          </button>

          <button
            onClick={() => setActiveSheet('simulator')}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center text-center gap-2 hover:bg-emerald-500/20 touch-feedback transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">{t.loanSimulator}</span>
          </button>
        </div>
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
