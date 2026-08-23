import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  createDebt,
  createPayment,
  updateTicketRequestStatus,
  updateLoanStatus,
  updateVisitStatus,
  updateManualScore,
} from './actions'
import {
  User,
  Shield,
  Ticket,
  MapPin,
  Landmark,
  Star,
  Users,
  Briefcase,
  ChevronDown,
  Wallet,
  HelpCircle,
  Award,
  Lightbulb,
} from 'lucide-react'
import { MobileNav } from '@/components/MobileNav'
import Image from 'next/image'
import Link from 'next/link'
import { formatCOP } from '@/utils/currency'
import { AdminParser } from '@/components/AdminParser'
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
import { AnimatedNumber } from '@/components/AnimatedNumber'

const dict = {
  en: {
    adminHq: 'Admin HQ',
    logout: 'Log out',
    addDebt: 'Add Manual Debt',
    selectUser: 'Select User...',
    desc: 'Description (e.g. Dinner)',
    descOpt: 'Description (Optional)',
    amount: 'Amount (COP)',
    addBtn: 'Add Debt',
    addPayment: 'Add Manual Payment',
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
    tracking: 'Total Debt Tracking Per User',
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
    addDebt: 'Agregar Deuda Manual',
    selectUser: 'Seleccionar...',
    desc: 'Descripción (ej. Cena)',
    descOpt: 'Descripción (Opcional)',
    amount: 'Monto (COP)',
    addBtn: 'Añadir',
    addPayment: 'Agregar Pago Manual',
    logPayment: 'Registrar',
    loans: 'Sol. de Préstamos',
    noLoans: 'No hay solicitudes.',
    approve: 'Aprobar',
    reject: 'Rechazar',
    tickets: 'Sol. de Entradas',
    noTickets: 'No hay solicitudes.',
    visits: 'Visitas a Casa',
    noVisits: 'No hay visitas.',
    eta: 'Hora:',
    tracking: 'Resumen Global por Usuario',
    grandTotal: 'Gran Total Pendiente (Fandi Bank)',
    suspended: 'Suspendido',
    score: 'Pts',
    totalOwedPending: 'Total Pendiente',
    creditBonus: 'Crédito',
    receipts: 'Desglose Individual',
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

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-5 md:p-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Condensed Header */}
        <header className="flex items-center justify-between pb-4 border-b border-white/10 glass-panel px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 relative shrink-0">
              <Image
                src={isSmiling ? '/sf_logo.png' : '/logo.png'}
                alt="Fandi Bank"
                fill
                className="object-cover rounded-full shadow-lg shadow-purple-900/40"
                priority
              />
            </div>
            <h1
              className={`text-xl sm:text-3xl font-black tracking-tight bg-clip-text text-transparent ${
                isSmiling
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-purple-400 to-fuchsia-500'
              }`}
            >
              {t.adminHq}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            <MobileNav profile={profile} t={t} isAdminPanel={true} />

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 pl-2 border-l border-white/10">
              <Link
                href="/suggest"
                className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-400 hover:text-blue-400 touch-feedback"
                title="Suggestions"
              >
                <Lightbulb className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-400 hover:text-emerald-400 touch-feedback"
                title="FAQ"
              >
                <HelpCircle className="w-4 h-4" />
              </Link>
              <Link
                href="/friends"
                className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-400 hover:text-purple-400 touch-feedback"
                title="Friends"
              >
                <Users className="w-4 h-4" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-feedback"
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
                <span className="text-sm font-bold text-zinc-200 hidden md:block">
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
                <button className="text-[10px] font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest px-2">
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

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Left Column - Forms & Actions */}
          <div className="space-y-6 lg:col-span-1">
            <AdminParser users={profiles || []} />

            <div className="flex flex-col gap-4">
              {/* Add Manual Debt */}
              <div className="p-4 sm:p-5 border border-red-500/25 rounded-3xl glass-panel shadow-xl overflow-hidden relative">
                <h2 className="text-sm sm:text-base font-black text-zinc-100 flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-red-400" />
                  {t.addDebt}
                </h2>
                <form action={createDebt} className="space-y-2.5">
                  <select
                    name="userId"
                    required
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 bg-zinc-900"
                  >
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      {t.selectUser}
                    </option>
                    {profiles?.map((p) => (
                      <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                        {p.username || p.email}
                      </option>
                    ))}
                  </select>
                  <input
                    name="description"
                    type="text"
                    required
                    placeholder={t.desc}
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
                  />
                  <input
                    name="amount"
                    type="number"
                    required
                    placeholder={t.amount}
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
                  />
                  <SubmitButton
                    loadingText="Adding..."
                    className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-black rounded-xl text-xs transition-all border border-red-500/20 tracking-wider uppercase touch-feedback"
                  >
                    {t.addBtn}
                  </SubmitButton>
                </form>
              </div>

              {/* Add Manual Payment */}
              <div className="p-4 sm:p-5 border border-purple-500/25 rounded-3xl glass-panel shadow-xl overflow-hidden relative">
                <h2 className="text-sm sm:text-base font-black text-zinc-100 flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  {t.addPayment}
                </h2>
                <form action={createPayment} className="space-y-2.5">
                  <select
                    name="userId"
                    required
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 bg-zinc-900"
                  >
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      {t.selectUser}
                    </option>
                    {profiles?.map((p) => (
                      <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                        {p.username || p.email}
                      </option>
                    ))}
                  </select>
                  <input
                    name="description"
                    type="text"
                    placeholder={t.descOpt}
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
                  />
                  <input
                    name="amount"
                    type="number"
                    required
                    placeholder={t.amount}
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
                  />
                  <SubmitButton
                    loadingText="Adding..."
                    className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-black rounded-xl text-xs transition-all border border-purple-500/20 tracking-wider uppercase touch-feedback"
                  >
                    {t.logPayment}
                  </SubmitButton>
                </form>
              </div>

              {/* Modify Score */}
              <div className="p-4 sm:p-5 border border-amber-500/25 rounded-3xl glass-panel shadow-xl overflow-hidden relative">
                <h2 className="text-sm sm:text-base font-black text-zinc-100 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-400" />
                  Modificar Puntaje Fandi
                </h2>
                <form action={updateManualScore} className="space-y-2.5">
                  <select
                    name="userId"
                    required
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 bg-zinc-900"
                  >
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      {t.selectUser}
                    </option>
                    {userTotals.map((p) => (
                      <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                        {p.username || p.email} ({p.score} pts)
                      </option>
                    ))}
                  </select>
                  <input
                    name="amount"
                    type="number"
                    required
                    placeholder="Cantidad (ej. 5 o -2)"
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
                  />
                  <SubmitButton
                    loadingText="Aplicando..."
                    className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black rounded-xl text-xs transition-all border border-amber-500/20 tracking-wider uppercase touch-feedback"
                  >
                    Aplicar Puntos
                  </SubmitButton>
                </form>
              </div>
            </div>

            {/* Dropdown for Loans */}
            <details className="group/loans glass-panel rounded-2xl p-3 shadow-lg border border-white/10">
              <summary className="text-sm font-bold text-zinc-200 flex items-center justify-between gap-2 cursor-pointer list-none select-none">
                <span className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" /> {t.loans} (
                  {loans?.length || 0})
                </span>
                <ChevronDown className="w-4 h-4 group-open/loans:rotate-180 transition-transform" />
              </summary>
              <div className="space-y-2.5 pt-3">
                {(!loans || loans.length === 0) && (
                  <p className="text-zinc-500 text-xs">{t.noLoans}</p>
                )}
                {loans?.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 border border-white/10 rounded-xl bg-black/40 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-200 text-xs truncate">
                          {req.profiles?.username}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
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
                      <p className="text-sm font-black text-amber-400">
                        {formatCOP(req.amount)}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <form action={updateLoanStatus} className="flex-1">
                          <input type="hidden" name="loanId" value={req.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            loadingText="."
                            className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold transition-colors border border-purple-500/30"
                          >
                            {t.approve}
                          </SubmitButton>
                        </form>
                        <form action={updateLoanStatus} className="flex-1">
                          <input type="hidden" name="loanId" value={req.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            loadingText="."
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-colors border border-red-500/30"
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

            {/* Dropdown for Tickets */}
            <details className="group/tickets glass-panel rounded-2xl p-3 shadow-lg border border-white/10">
              <summary className="text-sm font-bold text-zinc-200 flex items-center justify-between gap-2 cursor-pointer list-none select-none">
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-indigo-400" /> {t.tickets} (
                  {requests?.length || 0})
                </span>
                <ChevronDown className="w-4 h-4 group-open/tickets:rotate-180 transition-transform" />
              </summary>
              <div className="space-y-2.5 pt-3">
                {(!requests || requests.length === 0) && (
                  <p className="text-zinc-500 text-xs">{t.noTickets}</p>
                )}
                {requests?.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 border border-white/10 rounded-xl bg-black/40 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-200 text-xs truncate">
                          {req.profiles?.username}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
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
                      <p className="text-xs text-zinc-300 break-words">{req.event_name}</p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <form action={updateTicketRequestStatus} className="flex-1">
                          <input type="hidden" name="reqId" value={req.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            loadingText="."
                            className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold transition-colors border border-purple-500/30"
                          >
                            {t.approve}
                          </SubmitButton>
                        </form>
                        <form action={updateTicketRequestStatus} className="flex-1">
                          <input type="hidden" name="reqId" value={req.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            loadingText="."
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-colors border border-red-500/30"
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

            {/* Dropdown for Visits */}
            <details className="group/visits glass-panel rounded-2xl p-3 shadow-lg border border-white/10">
              <summary className="text-sm font-bold text-zinc-200 flex items-center justify-between gap-2 cursor-pointer list-none select-none">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-fuchsia-400" /> {t.visits} (
                  {visits?.length || 0})
                </span>
                <ChevronDown className="w-4 h-4 group-open/visits:rotate-180 transition-transform" />
              </summary>
              <div className="space-y-2.5 pt-3">
                {(!visits || visits.length === 0) && (
                  <p className="text-zinc-500 text-xs">{t.noVisits}</p>
                )}
                {visits?.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-3 border border-white/10 rounded-xl bg-black/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200 text-xs">
                        {visit.profiles?.username}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
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
                    <p className="text-xs text-zinc-300">
                      {new Date(visit.visit_date).toLocaleDateString()} · {t.eta}{' '}
                      {visit.arrival_time?.slice(0, 5)}
                    </p>
                    <p className="text-xs text-fuchsia-400 font-medium break-words">
                      {visit.stay_status}
                    </p>
                    {(!visit.status || visit.status === 'pending') && (
                      <div className="flex gap-2 pt-1">
                        <form action={updateVisitStatus} className="flex-1">
                          <input type="hidden" name="visitId" value={visit.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            loadingText="."
                            className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold transition-colors border border-purple-500/30"
                          >
                            {t.approve}
                          </SubmitButton>
                        </form>
                        <form action={updateVisitStatus} className="flex-1">
                          <input type="hidden" name="visitId" value={visit.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            loadingText="."
                            className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-colors border border-red-500/30"
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

          {/* Right Column - Overview & Analytics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Grand Total tracking with Animated Number */}
            <div className="p-6 sm:p-8 glass-panel-heavy rounded-[32px] border border-violet-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Shield className="w-32 h-32 text-violet-400" />
              </div>
              <p className="text-xs sm:text-sm font-black text-violet-300 uppercase tracking-widest mb-2 flex items-center gap-2 text-shadow-sm">
                <Shield className="w-4 h-4 text-violet-400" /> {t.grandTotal}
              </p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300 tracking-tighter text-shadow-md">
                <AnimatedNumber value={grandTotal} formatAsCurrency={true} duration={900} />
              </p>
            </div>

            {/* Events Manager */}
            <AdminEventsManager
              users={profiles || []}
              events={events || []}
              invitations={invitations || []}
            />

            {/* Payments Tracker */}
            <div className="pt-6 border-t border-white/10">
              <AdminPaymentsTracker
                payments={paymentsInfo || []}
                allocations={allocations || []}
                users={profiles || []}
              />
            </div>

            {/* User Cards Grid */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2.5 text-zinc-100 text-shadow-sm">
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
                          className={`px-2 py-0.5 rounded-full border text-[10px] uppercase font-black tracking-wider flex items-center gap-1 shrink-0 ${
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
          </div>
        </main>

        <div className="pt-6 border-t border-white/10">
          <AdminHelpCenter
            adminId={user.id}
            users={profiles || []}
            messages={allMessages || []}
          />
        </div>

        {/* Reset Game Progress & Games Section */}
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

        {/* Prize Requests */}
        <AdminPrizeRequests requests={prizeRequests || []} />

        {/* Suggestions Inbox */}
        <div className="pb-12">
          <AdminSuggestionsManager suggestions={suggestions || []} />
        </div>
      </div>
    </div>
  )
}
