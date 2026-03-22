import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { TicketRequestForm } from '@/components/TicketRequestForm'
import { VisitForm } from '@/components/VisitForm'
import { LoanRequestForm } from '@/components/LoanRequestForm'
import { ChatWidget } from '@/components/ChatWidget'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Receipt, Calendar, CreditCard, Ticket, Wallet, Sparkles, ChevronDown, Landmark, Star, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { formatCOP } from '@/utils/currency'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'

const dict = {
  en: {
    score: 'Score:',
    suspendedHeader: 'ACCOUNT SUSPENDED',
    suspendedBody: 'You have a debt that is over 180 days past due. Your Fandi Bank privileges are suspended.',
    myDebts: 'My Debts',
    totalOwed: 'Total Owed Pending',
    creditBonus: 'Credit',
    noDebts: 'No debts!',
    loanBdg: 'Loan',
    paymentHistory: 'Payment History',
    initial: 'Initial',
    interest: 'Interest',
    paid: 'Paid',
    paidStatus: 'paid',
    pendingStatus: 'pending',
    requestTicket: 'Request Concert Ticket',
    descTicket: 'Want to go to a concert but presale ends today? Let Fandi Bank buy it. You pay the presale price + 50% of the difference between presale and current price when you pay it back!',
    requestLoan: 'Request Fandi Loan',
    descLoan: 'Need cash fast? Request up to $500,000 COP immediately. Approved loans accrue 0.051% simple daily interest on the original amount.',
    visits: 'Mojo Dojo Casa House Visits',
    scheduleVisit: 'Schedule an upcoming visit'
  },
  es: {
    score: 'Puntos:',
    suspendedHeader: 'CUENTA SUSPENDIDA',
    suspendedBody: 'Tienes una deuda con más de 180 días de retraso. Tus privilegios en Fandi Bank están suspendidos.',
    myDebts: 'Mis Deudas',
    totalOwed: 'Total Pendiente',
    creditBonus: 'Crédito',
    noDebts: '¡No hay deudas!',
    loanBdg: 'Préstamo',
    paymentHistory: 'Historial',
    initial: 'Inicial',
    interest: 'Interés',
    paid: 'Pagado',
    paidStatus: 'pagado',
    pendingStatus: 'pendiente',
    requestTicket: 'Pedir Entrada de Concierto',
    descTicket: '¿Quieres ir a un concierto y no hay plata? Deja que Fandi Bank lo compre en preventa. ¡Pagas el precio de preventa + 50% de la diferencia con el precio actual cuando puedas!',
    requestLoan: 'Pedir Préstamo',
    descLoan: '¿Necesitas efectivo? Pide hasta $500,000 COP. Los préstamos aprobados generan un interés simple diario del 0.051% sobre el monto original.',
    visits: 'Visitas Mojo Dojo Casa House',
    scheduleVisit: 'Programa una visita'
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = dict[lang]

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') return redirect('/admin')

  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: allocations } = await supabase
    .from('payment_allocations')
    .select('*, payments(created_at)')
    .in('debt_id', debts?.map(d => d.id) || [])

  const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').single()
  const adminId = adminProfile?.id

  let chatMessages: any[] = []
  if (adminId) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    if (msgs) chatMessages = msgs
  }

  const { score, isSuspended } = calculateCreditScore((debts || []) as DebtForCredit[])

  const pendingDebts = debts?.filter(d => d.status === 'pending') || []
  const totalOwed = pendingDebts.reduce((acc, debt) => {
    const amount = Number(debt.amount)
    const paid = Number(debt.paid_amount || 0)
    const interest = calculateDebtInterest(debt as DebtForCredit)
    return acc + ((amount + interest) - paid)
  }, 0)
  
  const credits = Number(profile?.credit_balance || 0)

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-4 md:p-8 font-sans">
      
      {isSuspended && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-950/80 border-2 border-red-500 rounded-2xl p-6 flex items-start gap-4 shadow-2xl shadow-red-500/20 animate-[pulse_2s_ease-in-out_infinite]">
          <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <h2 className="text-xl font-black text-red-500 tracking-tighter">{t.suspendedHeader}</h2>
            <p className="text-red-200 mt-1 font-medium">{t.suspendedBody}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 relative hidden sm:block">
               <Image src="/logo.png" alt="Logo" fill className="object-cover rounded-full shadow-lg" priority />
             </div>
             <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
               Fandi Bank
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <div className={`px-4 py-1.5 rounded-full border text-sm font-black flex items-center gap-2 ${score >= 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
               <Star className="w-4 h-4" /> {t.score} {score}
            </div>
            <form action="/auth/signout" method="post">
              <button className="text-sm font-bold text-zinc-400 hover:text-zinc-200 transition-colors">
                Log out
              </button>
            </form>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Main Debt Overview */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Receipt className="w-6 h-6 text-purple-500" />
              {t.myDebts}
            </h2>

            <div className="p-8 rounded-[40px] bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-2xl shadow-purple-900/20 mb-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Wallet className="w-32 h-32 text-purple-500" />
              </div>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 relative z-10">{t.totalOwed}</p>
              <p className={`text-5xl sm:text-7xl font-black tracking-tighter relative z-10 ${totalOwed > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                {totalOwed === 0 ? '$0' : formatCOP(totalOwed)}
              </p>
              {credits > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">{t.creditBonus}: {formatCOP(credits)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(!debts || debts.length === 0) ? (
                <div className="p-12 border border-zinc-800/50 rounded-3xl text-center text-zinc-500 bg-zinc-900/10">
                  {t.noDebts}
                </div>
              ) : (
                debts.map(debt => {
                  const amount = Number(debt.amount)
                  const interest = calculateDebtInterest(debt as DebtForCredit)
                  const paid = Number(debt.paid_amount || 0)
                  const debtAllocs = allocations?.filter(a => a.debt_id === debt.id) || []

                  return (
                    <div key={debt.id} className="p-5 border border-white/5 rounded-3xl bg-zinc-900/30 backdrop-blur-[20px] hover:border-purple-500/30 transition-all shadow-lg group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-zinc-200">{debt.description}</h3>
                          {debt.is_loan && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[10px] uppercase tracking-widest font-black">{t.loanBdg}</span>}
                        </div>
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border ${
                          debt.status === 'paid' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {debt.status === 'paid' ? t.paidStatus : t.pendingStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t.initial}</p>
                          <p className="text-zinc-300 font-medium">{formatCOP(amount)}</p>
                        </div>
                        {interest > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-bold mb-1">{t.interest}</p>
                            <p className="text-amber-500 font-medium">+{formatCOP(interest)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t.paid}</p>
                          <p className="text-zinc-300 font-medium">{formatCOP(paid)}</p>
                        </div>
                      </div>

                      {debtAllocs.length > 0 && (
                        <details className="mt-4 pt-4 border-t border-zinc-800/50 group/details text-sm">
                          <summary className="cursor-pointer text-zinc-400 hover:text-purple-400 font-bold list-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                            {t.paymentHistory} <ChevronDown className="w-3 h-3 group-open/details:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-4 space-y-2">
                            {debtAllocs.map(alloc => (
                              <div key={alloc.id} className="flex justify-between items-center text-zinc-400 bg-black/20 p-2 rounded-lg">
                                <span>{new Date(alloc.payments?.created_at || alloc.created_at).toLocaleDateString()}</span>
                                <span className="font-medium text-emerald-400">+{formatCOP(alloc.allocated_amount)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Acciones Rápidas
            </h2>
            
            <div className="p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 text-purple-400 mb-2">
                <Ticket className="w-4 h-4" /> {t.requestTicket}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-medium leading-relaxed">{t.descTicket}</p>
              <TicketRequestForm />
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 text-amber-500 mb-2">
                <Landmark className="w-4 h-4" /> {t.requestLoan}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-medium leading-relaxed">{t.descLoan}</p>
              <LoanRequestForm />
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 text-fuchsia-400 mb-2">
                <Calendar className="w-4 h-4" /> {t.visits}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-medium">{t.scheduleVisit}</p>
              <VisitForm />
            </div>
          </div>

        </main>
      </div>
      
      {adminId && <ChatWidget userId={user.id} adminId={adminId} initialMessages={chatMessages} />}
    </div>
  )
}
