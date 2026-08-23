import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  updateTicketRequestStatus,
  updateLoanStatus,
  updateVisitStatus,
} from './actions'
import {
  User,
  Shield,
  Ticket,
  MapPin,
  Landmark,
  Star,
  Users,
  ChevronDown,
  Wallet,
  HelpCircle,
  Lightbulb,
} from 'lucide-react'
import { MobileNav } from '@/components/MobileNav'
import Image from 'next/image'
import Link from 'next/link'
import { formatCOP } from '@/utils/currency'
import { AdminHelpCenter } from '@/components/AdminHelpCenter'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ExperimentalTab } from '@/components/ExperimentalTab'
import { GamesTab } from '@/components/GamesTab'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'
import { SubmitButton } from '@/components/SubmitButton'
import { AdminPaymentsTracker } from '@/components/AdminPaymentsTracker'
import { AdminDebtReceipts } from '@/components/AdminDebtReceipts'
import { AdminEventsManager } from '@/components/AdminEventsManager'
import { ThemeSettings } from '@/components/ThemeSettings'
import { AdminSuggestionsManager } from '@/components/AdminSuggestionsManager'
import { AdminPrizeRequests } from '@/components/AdminPrizeRequests'
import { AdminQuickActions } from '@/components/AdminQuickActions'
import { AdminThemeManager } from '@/components/AdminThemeManager'
import { AdminBottomNav } from '@/components/AdminBottomNav'
import { AnimatedNumber } from '@/components/AnimatedNumber'

const dict = {
  en: {
    adminHq: 'Admin HQ',
    logout: 'Log out',
    addDebt: 'Add Debt',
    selectUser: 'Select User...',
    desc: 'Description (e.g. Dinner)',
    descOpt: 'Description (Optional)',
    amount: 'Amount (COP)',
    addBtn: 'Add Debt',
    addPayment: 'Log Payment',
    logPayment: 'Log Payment',
    loans: 'Loan Requests',
    noLoans: 'No loan requests.',
    approve: 'Approve',
    reject: 'Reject',
    tickets: 'Ticket Requests',
    noTickets: 'No ticket requests found.',
    visits: 'House Visits',
    noVisits: 'No visits requested.',
    eta: 'ETA:',
    tracking: 'User Balances & Credit Overview',
    grandTotal: 'Grand Total PENDING Owed',
    suspended: 'Suspended',
    score: 'Score',
    totalOwedPending: 'Total Owed Pending',
    creditBonus: 'Credit',
    receipts: 'Individual Debt Receipts',
    noDebts: 'No individual debts found.',
    user: 'User',
    loanBadge: 'Loan',
    paymentHistory: 'Payment History',
    initialLabel: 'Initial',
    interestLabel: 'Interest',
    paidLabel: 'Paid',
    paidStatus: 'paid',
    pendingStatus: 'pending',
    created: 'Created',
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
  },
  es: {
    adminHq: 'Panel de Admin',
    logout: 'Cerrar Sesión',
    addDebt: 'Añadir Deuda',
    selectUser: 'Seleccionar...',
    desc: 'Descripción (ej. Cena)',
    descOpt: 'Descripción (Opcional)',
    amount: 'Monto (COP)',
    addBtn: 'Añadir',
    addPayment: 'Registrar Pago',
    logPayment: 'Registrar',
    loans: 'Sol. de Préstamos',
    noLoans: 'No hay solicitudes de préstamo.',
    approve: 'Aprobar',
    reject: 'Rechazar',
    tickets: 'Sol. de Entradas',
    noTickets: 'No hay solicitudes de entradas.',
    visits: 'Visitas a Casa',
    noVisits: 'No hay visitas programadas.',
    eta: 'Hora:',
    tracking: 'Saldos Globales por Usuario',
    grandTotal: 'Gran Total Pendiente (Fandi Bank)',
    suspended: 'Suspendido',
    score: 'Pts',
    totalOwedPending: 'Total Pendiente',
    creditBonus: 'Crédito',
    receipts: 'Desglose Individual de Recibos',
    noDebts: 'No hay deudas.',
    user: 'Usuario',
    loanBadge: 'Préstamo',
    paymentHistory: 'Historial',
    initialLabel: 'Inicial',
    interestLabel: 'Interés',
    paidLabel: 'Pagado',
    paidStatus: 'pagado',
    pendingStatus: 'pendiente',
    created: 'Creado',
    pending: 'pendiente',
    approved: 'aprobado',
    rejected: 'rechazado',
  },
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = dict[lang]

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'role, username, avatar_url, credit_balance, sf_progress, active_theme, fandi_coins, coin_sync_version'
    )
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  const { data: debts } = await supabase
    .from('debts')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
  const { data: allocations } = await supabase
    .from('payment_allocations')
    .select('*, payments(created_at, total_amount)')
  const { data: paymentsInfo } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  const { data: requests } = await supabase
    .from('ticket_requests')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
  const { data: visits } = await supabase
    .from('visit_requests')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
  const { data: loans } = await supabase
    .from('loan_requests')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
  const { data: allMessages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  const { data: invitations } = await supabase.from('event_invitations').select('*')
  const { data: suggestions } = await supabase
    .from('user_suggestions')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
  const { data: prizeRequests } = await supabase
    .from('prize_requests')
    .select('*, profiles(username, email)')
    .order('created_at', { ascending: false })

  const avatarMap: Record<string, string> = {}
  for (const p of profiles || []) {
    if (p.avatar_url) avatarMap[p.id] = p.avatar_url
  }

  let grandTotal = 0
  const userTotals = (profiles || []).map((p) => {
    const userDebts = (debts || []).filter((d) => d.user_id === p.id)
    const pendingDebts = userDebts.filter((d) => d.status === 'pending')
    let { score, isSuspended } = calculateCreditScore(userDebts as DebtForCredit[])

    const sfRandoms = p?.sf_progress?.randoms_smiled || 0
    const sfUnlocked = p?.sf_progress?.unlocked_mains?.length || 0
    score += sfRandoms * 15 + sfUnlocked * 200 + (sfUnlocked === 6 ? 50 : 0)
    score += p?.manual_score_modifier || 0

    let totalRemaining = 0
    pendingDebts.forEach((pd) => {
      const interest = calculateDebtInterest(pd as DebtForCredit)
      totalRemaining += Number(pd.amount) + interest - Number(pd.paid_amount || 0)
    })
    const userCredits = Number(p.credit_balance || 0)
    grandTotal += totalRemaining
    return { ...p, totalRemaining, userCredits, debts: userDebts, score, isSuspended }
  })

  const debtsByUser: Record<
    string,
    { username: string; avatarUrl: string | null; debts: any[] }
  > = {}
  for (const debt of debts || []) {
    const uid = debt.user_id
    if (!debtsByUser[uid]) {
      debtsByUser[uid] = {
        username: debt.profiles?.username || uid,
        avatarUrl: debt.profiles?.avatar_url || avatarMap[uid] || null,
        debts: [],
      }
    }
    debtsByUser[uid].debts.push(debt)
  }

  const isSmiling = profile?.active_theme === 'smiling_friends'
  const isStarWars = profile?.active_theme === 'star_wars'
  const logoSrc = isStarWars ? '/sw_logo.png' : isSmiling ? '/sf_logo.png' : '/logo.png'

  // Count pending items for badges
  const pendingLoans = loans?.filter((l) => l.status === 'pending') || []
  const pendingTickets = requests?.filter((r) => r.status === 'pending') || []
  const pendingVisits = visits?.filter((v) => !v.status || v.status === 'pending') || []
  const totalPendingRequests =
    pendingLoans.length + pendingTickets.length + pendingVisits.length

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-5 md:p-8 font-sans pb-28">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Condensed Mobile-First Header */}
        <header className="flex items-center justify-between pb-4 border-b border-white/10 glass-panel px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 relative shrink-0">
              <Image
                src={logoSrc}
                alt="Fandi Bank"
                fill
                className="object-cover rounded-full shadow-lg shadow-purple-900/40"
                priority
              />
            </div>
            <div>
              <h1
                className={`text-lg sm:text-2xl font-black tracking-tight bg-clip-text text-transparent text-shadow-sm ${
                  isStarWars
                    ? 'bg-gradient-to-r from-cyan-400 via-white to-amber-300'
                    : isSmiling
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-purple-400 to-fuchsia-500'
                }`}
              >
                {t.adminHq}
              </h1>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest sm:hidden">
                Admin Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            <MobileNav profile={profile} t={t} isAdminPanel={true} />

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 pl-2 border-l border-white/10">
              <Link
                href="/suggest"
                className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-300 hover:text-blue-400 touch-feedback"
                title="Suggestions"
              >
                <Lightbulb className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-300 hover:text-emerald-400 touch-feedback"
                title="FAQ"
              >
                <HelpCircle className="w-4 h-4" />
              </Link>
              <Link
                href="/friends"
                className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-300 hover:text-purple-400 touch-feedback"
                title="Friends"
              >
                <Users className="w-4 h-4" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-85 transition-opacity touch-feedback"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-purple-500/30 bg-black flex items-center justify-center shadow-md">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-200 hidden md:block">
                  {profile?.username || 'Profile'}
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="hidden sm:flex px-3.5 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 text-[10px] uppercase font-black tracking-wider transition-colors shrink-0"
              >
                View as User
              </Link>
              <form action="/auth/signout" method="post">
                <button className="text-[10px] font-bold text-zinc-400 hover:text-red-400 transition-colors uppercase tracking-widest px-2">
                  {t.logout}
                </button>
              </form>
              <ThemeSettings
                activeTheme={profile?.active_theme || 'normal'}
                hasSmilingFriends={profile?.sf_progress?.unlocked_mains?.length >= 6}
              />
            </div>
          </div>
        </header>

        {/* Grand Total Hero Card with AnimatedNumber */}
        <div className="p-6 sm:p-8 glass-panel-heavy rounded-[32px] border border-violet-500/40 shadow-2xl relative overflow-hidden bg-violet-950/20">
          <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
            <Shield className="w-32 h-32 text-violet-400" />
          </div>
          <p className="text-xs sm:text-sm font-black text-violet-300 uppercase tracking-widest mb-1.5 flex items-center gap-2 text-shadow-sm">
            <Shield className="w-4 h-4 text-violet-400" /> {t.grandTotal}
          </p>
          <p className="text-3xl sm:text-5xl md:text-6xl font-black text-violet-200 tracking-tight text-shadow-lg drop-shadow-[0_0_35px_rgba(216,180,254,0.75)]">
            <AnimatedNumber value={grandTotal} formatAsCurrency={true} duration={900} />
          </p>
        </div>

        {/* Mobile-First Admin Quick Actions Bar (Drawers for Debt, Payment, Score, Parser) */}
        <AdminQuickActions users={profiles || []} t={t} />

        {/* Admin Themes & Progress Management Suite */}
        <AdminThemeManager
          currentTheme={profile?.active_theme}
          hasSmilingFriends={(profile?.sf_progress?.unlocked_mains?.length || 0) >= 6}
        />

        {/* Pending Requests Hub (Loans, Tickets, Visits) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-zinc-200 tracking-wider uppercase flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-400" />
              Solicitudes de Usuarios
              {totalPendingRequests > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {totalPendingRequests} pendientes
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Loan Requests Accordion */}
            <details
              open={pendingLoans.length > 0}
              className="glass-panel rounded-[24px] p-4 shadow-lg border border-white/10 group/loans"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between select-none">
                <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" /> {t.loans}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">
                    {loans?.length || 0}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open/loans:rotate-180 transition-transform" />
              </summary>
              <div className="space-y-2.5 pt-3">
                {(!loans || loans.length === 0) && (
                  <p className="text-zinc-500 text-xs py-2">{t.noLoans}</p>
                )}
                {loans?.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 border border-white/10 rounded-2xl bg-black/45 flex flex-col justify-between gap-2 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-100 text-xs truncate">
                          {req.profiles?.username}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border ${
                            req.status === 'approved'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : req.status === 'rejected'
                              ? 'bg-red-500/15 text-red-300 border-red-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-black text-amber-400">
                        {formatCOP(req.amount)}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <form action={updateLoanStatus} className="flex-1">
                          <input type="hidden" name="loanId" value={req.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            loadingText=".."
                            className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-colors border border-purple-500/30 touch-feedback"
                          >
                            {t.approve}
                          </SubmitButton>
                        </form>
                        <form action={updateLoanStatus} className="flex-1">
                          <input type="hidden" name="loanId" value={req.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            loadingText=".."
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-colors border border-red-500/30 touch-feedback"
                          >
                            {t.reject}
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>

            {/* 2. Ticket Requests Accordion */}
            <details
              open={pendingTickets.length > 0}
              className="glass-panel rounded-[24px] p-4 shadow-lg border border-white/10 group/tickets"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between select-none">
                <span className="text-xs sm:text-sm font-black text-indigo-300 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-indigo-400" /> {t.tickets}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-black border border-indigo-500/30">
                    {requests?.length || 0}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open/tickets:rotate-180 transition-transform" />
              </summary>
              <div className="space-y-2.5 pt-3">
                {(!requests || requests.length === 0) && (
                  <p className="text-zinc-500 text-xs py-2">{t.noTickets}</p>
                )}
                {requests?.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 border border-white/10 rounded-2xl bg-black/45 flex flex-col justify-between gap-2 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-100 text-xs truncate">
                          {req.profiles?.username}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border ${
                            req.status === 'approved'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : req.status === 'rejected'
                              ? 'bg-red-500/15 text-red-300 border-red-500/30'
                              : 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 break-words font-medium">
                        {req.event_name}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <form action={updateTicketRequestStatus} className="flex-1">
                          <input type="hidden" name="reqId" value={req.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            loadingText=".."
                            className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-colors border border-purple-500/30 touch-feedback"
                          >
                            {t.approve}
                          </SubmitButton>
                        </form>
                        <form action={updateTicketRequestStatus} className="flex-1">
                          <input type="hidden" name="reqId" value={req.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            loadingText=".."
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-colors border border-red-500/30 touch-feedback"
                          >
                            {t.reject}
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>

            {/* 3. House Visits Accordion */}
            <details
              open={pendingVisits.length > 0}
              className="glass-panel rounded-[24px] p-4 shadow-lg border border-white/10 group/visits"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between select-none">
                <span className="text-xs sm:text-sm font-black text-fuchsia-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-fuchsia-400" /> {t.visits}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 font-black border border-fuchsia-500/30">
                    {visits?.length || 0}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open/visits:rotate-180 transition-transform" />
              </summary>
              <div className="space-y-2.5 pt-3">
                {(!visits || visits.length === 0) && (
                  <p className="text-zinc-500 text-xs py-2">{t.noVisits}</p>
                )}
                {visits?.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-3 border border-white/10 rounded-2xl bg-black/45 space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-100 text-xs">
                        {visit.profiles?.username}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border ${
                          visit.status === 'approved'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : visit.status === 'rejected'
                            ? 'bg-red-500/15 text-red-300 border-red-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {visit.status || t.pending}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium">
                      {new Date(visit.visit_date).toLocaleDateString()} · {t.eta}{' '}
                      {visit.arrival_time?.slice(0, 5)}
                    </p>
                    <p className="text-xs text-fuchsia-300 font-semibold break-words">
                      {visit.stay_status}
                    </p>
                    {(!visit.status || visit.status === 'pending') && (
                      <div className="flex gap-2 pt-1">
                        <form action={updateVisitStatus} className="flex-1">
                          <input type="hidden" name="visitId" value={visit.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            loadingText=".."
                            className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-colors border border-purple-500/30 touch-feedback"
                          >
                            {t.approve}
                          </SubmitButton>
                        </form>
                        <form action={updateVisitStatus} className="flex-1">
                          <input type="hidden" name="visitId" value={visit.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            loadingText=".."
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-colors border border-red-500/30 touch-feedback"
                          >
                            {t.reject}
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Events Manager */}
        <AdminEventsManager
          users={profiles || []}
          events={events || []}
          invitations={invitations || []}
        />

        {/* Payments Tracker */}
        <AdminPaymentsTracker
          payments={paymentsInfo || []}
          allocations={allocations || []}
          users={profiles || []}
        />

        {/* User Cards Grid */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-base sm:text-xl font-black flex items-center gap-2.5 text-zinc-100 text-shadow-sm">
            <User className="w-5 h-5 text-violet-400" /> {t.tracking}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {userTotals.map((u) => {
              const total = u.totalRemaining
              const credits = Number(u.credit_balance || 0)
              return (
                <div
                  key={u.id}
                  className={`p-5 rounded-3xl glass-panel border shadow-lg relative overflow-hidden transition-all ${
                    u.isSuspended
                      ? 'border-red-500 bg-red-950/40'
                      : total > 0
                      ? 'border-red-500/25'
                      : credits > 0
                      ? 'border-purple-500/30'
                      : 'border-white/10'
                  }`}
                >
                  {u.isSuspended && (
                    <div className="absolute top-0 right-0 bg-red-500 text-red-950 font-black text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                      {t.suspended}
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-zinc-100 text-sm sm:text-base truncate pr-2">
                      {u.username || u.email}
                    </h3>
                    <div
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-black tracking-wider flex items-center gap-1 shrink-0 ${
                        u.score >= 0
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}
                    >
                      <Star className="w-3 h-3" /> {u.score}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                      {t.totalOwedPending}
                    </p>
                    <p
                      className={`text-2xl sm:text-3xl font-black ${
                        total > 0 ? 'text-red-400' : 'text-zinc-400'
                      }`}
                    >
                      <AnimatedNumber value={total} formatAsCurrency={true} />
                    </p>
                  </div>
                  {credits > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30">
                      <Wallet className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        +{formatCOP(credits)} {t.creditBonus}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Individual Debt Receipts */}
        <AdminDebtReceipts
          debtsByUser={debtsByUser}
          allocations={allocations || []}
          t={t}
        />

        {/* Live Support Inbox */}
        <div className="pt-6 border-t border-white/10">
          <AdminHelpCenter
            adminId={user.id}
            users={profiles || []}
            messages={allMessages || []}
          />
        </div>

        {/* Prize Requests */}
        <AdminPrizeRequests requests={prizeRequests || []} />

        {/* Suggestions Inbox */}
        <AdminSuggestionsManager suggestions={suggestions || []} />

        {/* Reset Game Progress & Mini Games */}
        <div className="relative pt-6 border-t border-white/10">
          <div className="flex justify-end pb-2">
            <form
              action={async () => {
                'use server'
                const { resetSmilingFriends } = await import('@/app/dashboard/actions')
                await resetSmilingFriends()
              }}
            >
              <button className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-2xl text-xs font-bold transition-all touch-feedback">
                Reset Game Progress (Admin)
              </button>
            </form>
          </div>
          <GamesTab
            lang={lang}
            initialProgress={profile?.sf_progress}
            initialCoins={profile?.fandi_coins || 0}
            initialVersion={profile?.coin_sync_version || 0}
          />
          <ExperimentalTab lang={lang} />
        </div>

        {/* Mobile Fixed Admin Bottom Navigation Bar */}
        <AdminBottomNav users={profiles || []} t={t} />
      </div>
    </div>
  )
}
