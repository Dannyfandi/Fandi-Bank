import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createDebt, createPayment, deleteDebt, markDebtPaid, updateTicketRequestStatus, updateLoanStatus, updateVisitStatus } from './actions'
import { User, Receipt, Shield, Check, X, Ticket, MapPin, Wallet, ChevronDown, Landmark, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCOP } from '@/utils/currency'
import { AdminParser } from '@/components/AdminParser'
import { AdminHelpCenter } from '@/components/AdminHelpCenter'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ExperimentalTab } from '@/components/ExperimentalTab'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'

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
    grandTotal: 'Grand Total Owed To Fandi Bank',
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
  }
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = dict[lang]

  const { data: profile } = await supabase.from('profiles').select('role, username, avatar_url').eq('id', user.id).single()
  if (profile?.role !== 'admin') return redirect('/dashboard')

  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  const { data: debts } = await supabase.from('debts').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false })
  const { data: allocations } = await supabase.from('payment_allocations').select('*, payments(created_at, total_amount)')
  const { data: requests } = await supabase.from('ticket_requests').select('*, profiles(username)').order('created_at', { ascending: false })
  const { data: visits } = await supabase.from('visit_requests').select('*, profiles(username)').order('created_at', { ascending: false })
  const { data: loans } = await supabase.from('loan_requests').select('*, profiles(username)').order('created_at', { ascending: false })
  const { data: allMessages } = await supabase.from('messages').select('*').order('created_at', { ascending: true })

  // Build profile avatar lookup
  const avatarMap: Record<string, string> = {}
  for (const p of (profiles || [])) {
    if (p.avatar_url) avatarMap[p.id] = p.avatar_url
  }

  let grandTotal = 0
  const userTotals = (profiles || []).map(p => {
    const userDebts = (debts || []).filter(d => d.user_id === p.id)
    const pendingDebts = userDebts.filter(d => d.status === 'pending')
    const { score, isSuspended } = calculateCreditScore(userDebts as DebtForCredit[])
    let totalRemaining = 0
    pendingDebts.forEach(pd => {
      const interest = calculateDebtInterest(pd as DebtForCredit)
      totalRemaining += ((Number(pd.amount) + interest) - Number(pd.paid_amount || 0))
    })
    grandTotal += totalRemaining
    return { ...p, totalRemaining, debts: userDebts, score, isSuspended }
  })

  // Group debts by user
  const debtsByUser: Record<string, { username: string; avatarUrl: string | null; debts: any[] }> = {}
  for (const debt of (debts || [])) {
    const uid = debt.user_id
    if (!debtsByUser[uid]) {
      debtsByUser[uid] = {
        username: debt.profiles?.username || uid,
        avatarUrl: debt.profiles?.avatar_url || avatarMap[uid] || null,
        debts: []
      }
    }
    debtsByUser[uid].debts.push(debt)
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header — bigger logo, no Fandi Bank text */}
        <header className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 relative shrink-0">
               <Image src="/logo.png" alt="Fandi Bank" fill className="object-cover rounded-full shadow-lg shadow-purple-900/30" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-600 bg-clip-text text-transparent">
              {t.adminHq}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
              <Link href="/friends" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-purple-400" title="Friends">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-purple-500/30 bg-black flex items-center justify-center shadow-lg shadow-purple-900/40">
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                   )}
                </div>
                <span className="text-sm font-bold text-zinc-200 hidden md:block">{profile?.username || 'Profile'}</span>
              </Link>
              <form action="/auth/signout" method="post">
                <button className="text-[10px] sm:text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest hidden sm:block">
                  {t.logout}
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Left Column */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-1">
            <AdminParser users={profiles || []} />

            <div className="flex flex-col gap-4">
              {/* Add Manual Debt */}
              <div className="p-4 sm:p-6 border border-red-500/20 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-xl overflow-hidden relative">
                 <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2 mb-3 sm:mb-4">
                   <Receipt className="w-4 h-4 text-red-500" />
                   {t.addDebt}
                 </h2>
                 <form action={createDebt} className="space-y-2 sm:space-y-3">
                   <select name="userId" required className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none">
                     <option value="">{t.selectUser}</option>
                     {profiles?.map(p => <option key={p.id} value={p.id}>{p.username || p.email}</option>)}
                   </select>
                   <input name="description" type="text" required placeholder={t.desc} className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none" />
                   <input name="amount" type="number" required placeholder={t.amount} className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none" />
                   <button className="w-full py-2.5 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold rounded-lg text-sm transition-all border border-red-500/10 tracking-widest uppercase">{t.addBtn}</button>
                 </form>
              </div>

              {/* Add Manual Payment */}
              <div className="p-4 sm:p-6 border border-purple-500/20 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-xl overflow-hidden relative">
                 <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2 mb-3 sm:mb-4">
                   <Wallet className="w-4 h-4 text-purple-500" />
                   {t.addPayment}
                 </h2>
                 <form action={createPayment} className="space-y-2 sm:space-y-3">
                   <select name="userId" required className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-purple-500 outline-none">
                     <option value="">{t.selectUser}</option>
                     {profiles?.map(p => <option key={p.id} value={p.id}>{p.username || p.email}</option>)}
                   </select>
                   <input name="description" type="text" placeholder={t.descOpt} className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-purple-500 outline-none" />
                   <input name="amount" type="number" required placeholder={t.amount} className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-purple-500 outline-none" />
                   <button className="w-full py-2.5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 font-bold rounded-lg text-sm transition-all border border-purple-500/10 tracking-widest uppercase">{t.logPayment}</button>
                 </form>
              </div>
            </div>

            {/* Loan Requests */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-500" /> {t.loans}
              </h3>
              <div className="space-y-3">
                {(!loans || loans.length === 0) && <p className="text-zinc-500 text-sm">{t.noLoans}</p>}
                {loans?.map(req => (
                  <div key={req.id} className="p-3 sm:p-4 border border-white/10 rounded-xl sm:rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-zinc-200 text-sm">{req.profiles?.username}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${req.status === 'approved' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{req.status}</span>
                      </div>
                      <p className="text-base sm:text-lg font-black text-amber-500 mb-3">{formatCOP(req.amount)}</p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                         <form action={updateLoanStatus} className="flex-1"><input type="hidden" name="loanId" value={req.id} /><input type="hidden" name="status" value="approved" /><button className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors border border-purple-500/30">{t.approve}</button></form>
                         <form action={updateLoanStatus} className="flex-1"><input type="hidden" name="loanId" value={req.id} /><input type="hidden" name="status" value="rejected" /><button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/30">{t.reject}</button></form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Requests */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-400" /> {t.tickets}
              </h3>
              <div className="space-y-3">
                {(!requests || requests.length === 0) && <p className="text-zinc-500 text-sm">{t.noTickets}</p>}
                {requests?.map(req => (
                  <div key={req.id} className="p-3 sm:p-4 border border-white/10 rounded-xl sm:rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-zinc-200 text-sm">{req.profiles?.username}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${req.status === 'approved' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}`}>{req.status}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3 break-words">{req.event_name}</p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                         <form action={updateTicketRequestStatus} className="flex-1"><input type="hidden" name="reqId" value={req.id} /><input type="hidden" name="status" value="approved" /><button className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors border border-purple-500/30">{t.approve}</button></form>
                         <form action={updateTicketRequestStatus} className="flex-1"><input type="hidden" name="reqId" value={req.id} /><input type="hidden" name="status" value="rejected" /><button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/30">{t.reject}</button></form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visit Requests — with Accept/Reject, sorted newest first */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-fuchsia-400" /> {t.visits}
              </h3>
              <div className="space-y-3">
                {(!visits || visits.length === 0) && <p className="text-zinc-500 text-sm">{t.noVisits}</p>}
                {visits?.map(visit => (
                  <div key={visit.id} className="p-3 sm:p-4 border border-white/10 rounded-xl sm:rounded-2xl bg-zinc-900/30 backdrop-blur-[40px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-zinc-200 text-sm">{visit.profiles?.username}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                        visit.status === 'approved' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : visit.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {visit.status || t.pending}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300">{new Date(visit.visit_date).toLocaleDateString()} · {t.eta} {visit.arrival_time?.slice(0, 5)}</p>
                    <p className="text-sm text-fuchsia-400 font-medium break-words mt-1">{visit.stay_status}</p>
                    {(!visit.status || visit.status === 'pending') && (
                      <div className="flex gap-2 mt-3">
                        <form action={updateVisitStatus} className="flex-1"><input type="hidden" name="visitId" value={visit.id} /><input type="hidden" name="status" value="approved" /><button className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors border border-purple-500/30">{t.approve}</button></form>
                        <form action={updateVisitStatus} className="flex-1"><input type="hidden" name="visitId" value={visit.id} /><input type="hidden" name="status" value="rejected" /><button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/30">{t.reject}</button></form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" /> {t.tracking}
            </h2>

            {/* Grand Total */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-violet-500/5 mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> {t.grandTotal}
              </p>
              <p className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tracking-tighter">
                {formatCOP(grandTotal)}
              </p>
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {userTotals.map(u => {
                const total = u.totalRemaining
                const formatted = total === 0 ? '$0' : formatCOP(total)
                const credits = Number(u.credit_balance || 0)
                return (
                  <div key={u.id} className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-lg relative overflow-hidden ${u.isSuspended ? 'bg-red-950/40 border-red-500' : total > 0 ? 'bg-zinc-900/30 backdrop-blur-[40px] border-red-500/20' : credits > 0 ? 'bg-zinc-900/30 backdrop-blur-[40px] border-purple-500/30' : 'bg-zinc-900/30 backdrop-blur-[40px] border-white/10'}`}>
                    {u.isSuspended && <div className="absolute top-0 right-0 bg-red-500 text-red-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-widest">{t.suspended}</div>}
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <h3 className="font-bold text-zinc-200 text-base sm:text-lg truncate pr-2">{u.username || u.email}</h3>
                      <div className={`px-2 py-1 rounded-lg border text-[10px] uppercase font-black tracking-widest flex items-center gap-1 shrink-0 ${u.score >= 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <Star className="w-3 h-3" /> {t.score} {u.score}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">{t.totalOwedPending}</p>
                      <p className={`text-3xl sm:text-4xl font-black ${total > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{formatted}</p>
                    </div>
                    {credits > 0 && (
                      <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                        <Wallet className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest">+ {formatCOP(credits)} {t.creditBonus}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Grouped Debt Receipts by User — with avatars */}
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <Receipt className="w-5 h-5 text-zinc-500" /> {t.receipts}
            </h2>

            <div className="space-y-3">
              {Object.keys(debtsByUser).length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-zinc-500 border border-white/10 rounded-2xl bg-zinc-900/10">{t.noDebts}</div>
              ) : (
                Object.entries(debtsByUser).map(([uid, group]) => (
                  <details key={uid} className="border border-white/10 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] overflow-hidden shadow-lg group/userDebts">
                    <summary className="cursor-pointer list-none flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/20 bg-black flex items-center justify-center shrink-0">
                          {group.avatarUrl ? (
                            <img src={group.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <span className="font-bold text-zinc-200">{group.username}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-full">{group.debts.length} debts</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-zinc-500 group-open/userDebts:rotate-180 transition-transform" />
                    </summary>

                    <div className="border-t border-white/10 divide-y divide-white/5">
                      {group.debts.map(debt => {
                        const amount = Number(debt.amount)
                        const paid = Number(debt.paid_amount || 0)
                        const interest = calculateDebtInterest(debt as DebtForCredit)
                        const debtAllocs = allocations?.filter(a => a.debt_id === debt.id) || []
                        const createdDate = new Date(debt.created_at).toLocaleDateString()

                        return (
                          <div key={debt.id} className="p-3 sm:p-4 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-zinc-200 text-sm">{debt.description}</span>
                                {debt.is_loan && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] uppercase tracking-widest font-black">{t.loanBadge}</span>}
                                <span className="text-[10px] text-zinc-600">{t.created}: {createdDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${debt.status === 'paid' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                  {debt.status === 'paid' ? t.paidStatus : t.pendingStatus}
                                </span>
                                {debt.status === 'pending' && (
                                  <form action={markDebtPaid} className="inline"><input type="hidden" name="debtId" value={debt.id} /><button title="Mark Paid" className="p-1.5 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors"><Check className="w-3 h-3" /></button></form>
                                )}
                                <form action={deleteDebt} className="inline"><input type="hidden" name="debtId" value={debt.id} /><button title="Delete" className="p-1.5 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><X className="w-3 h-3" /></button></form>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span className="text-zinc-500">{t.initialLabel}: <span className="text-zinc-300">{formatCOP(amount)}</span></span>
                              {interest > 0 && <span className="text-amber-500/70">+{formatCOP(interest)} {t.interestLabel}</span>}
                              <span className="text-zinc-500">{t.paidLabel}: <span className="text-zinc-300">{formatCOP(paid)}</span></span>
                            </div>
                            {debtAllocs.length > 0 && (
                              <details className="mt-2 group/allocs">
                                <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-purple-500 font-bold list-none flex items-center gap-1 hover:text-purple-400">
                                  {t.paymentHistory} <ChevronDown className="w-2.5 h-2.5 group-open/allocs:rotate-180 transition-transform" />
                                </summary>
                                <div className="mt-2 space-y-1">
                                  {debtAllocs.map(alloc => (
                                    <div key={alloc.id} className="flex justify-between text-xs text-zinc-400 bg-black/20 p-1.5 rounded">
                                      <span>{new Date(alloc.payments?.created_at || alloc.created_at).toLocaleDateString()}</span>
                                      <span className="font-bold text-purple-400">+{formatCOP(alloc.allocated_amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </main>

        <div className="pt-6 sm:pt-8">
           <AdminHelpCenter adminId={user.id} users={profiles || []} messages={allMessages || []} />
        </div>

        {/* Experimental Tab */}
        <ExperimentalTab lang={lang} />
      </div>
    </div>
  )
}
