import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { TicketRequestForm } from '@/components/TicketRequestForm'
import { VisitForm } from '@/components/VisitForm'
import { LoanRequestForm } from '@/components/LoanRequestForm'
import { ChatWidget } from '@/components/ChatWidget'
import { LanguageToggle } from '@/components/LanguageToggle'
import { DashboardClient } from '@/components/DashboardClient'
import { Ticket, Calendar, Landmark, Sparkles, Star, User, Users } from 'lucide-react'
import { LoanSimulator } from '@/components/LoanSimulator'
import Image from 'next/image'
import Link from 'next/link'
import { formatCOP } from '@/utils/currency'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'

const sideDict = {
  en: {
    actions: 'Quick Actions',
    requestTicket: 'Request Concert Ticket',
    descTicket: 'Want to go to a concert but presale ends today? Let Fandi Bank buy it. You pay the presale price + 50% of the difference between presale and current price when you pay it back!',
    requestLoan: 'Request Fandi Loan',
    descLoan: 'Need cash fast? Request up to $500,000 COP immediately. Approved loans accrue 0.051% simple daily interest on the original amount.',
    visits: 'Mojo Dojo Casa House Visits',
    scheduleVisit: 'Schedule an upcoming visit',
    logout: 'Log Out',
    score: 'Score:'
  },
  es: {
    actions: 'Acciones Rápidas',
    requestTicket: 'Pedir Entrada de Concierto',
    descTicket: '¿Quieres ir a un concierto y no hay plata? Deja que Fandi Bank lo compre en preventa. ¡Pagas el precio de preventa + 50% de la diferencia con el precio actual cuando puedas!',
    requestLoan: 'Pedir Préstamo',
    descLoan: '¿Necesitas efectivo? Pide hasta $500,000 COP. Los préstamos aprobados generan un interés simple diario del 0.051% sobre el monto original.',
    visits: 'Visitas Mojo Dojo Casa House',
    scheduleVisit: 'Programa una visita',
    logout: 'Salir',
    score: 'Puntos:'
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = sideDict[lang]

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role === 'admin') return redirect('/admin')

  const { data: debts } = await supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

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

  // Pre-compute interest map on the server
  const interestMap: Record<string, number> = {}
  const pendingDebts = debts?.filter(d => d.status === 'pending') || []
  let totalOwed = 0
  for (const debt of (debts || [])) {
    const interest = calculateDebtInterest(debt as DebtForCredit)
    interestMap[debt.id] = interest
    if (debt.status === 'pending') {
      totalOwed += (Number(debt.amount) + interest) - Number(debt.paid_amount || 0)
    }
  }

  const credits = Number(profile?.credit_balance || 0)

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between pb-4 sm:pb-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-cover rounded-full shadow-lg" priority />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Fandi Bank
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle />
            <div className={`hidden sm:flex px-3 py-1.5 rounded-full border text-sm font-black items-center gap-2 ${score >= 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <Star className="w-4 h-4" /> {t.score} {score}
            </div>
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

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
          
          {/* Debt Section */}
          <div className="lg:col-span-2 space-y-4">
            <DashboardClient
              profile={profile}
              debts={debts || []}
              allocations={allocations || []}
              totalOwed={totalOwed}
              credits={credits}
              score={score}
              isSuspended={isSuspended}
              lang={lang}
              interestMap={interestMap}
            />
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {t.actions}
            </h2>
            
            {/* Mobile: score badge inline */}
            <div className={`sm:hidden flex px-3 py-1.5 rounded-full border text-sm font-black items-center gap-2 w-fit ${score >= 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <Star className="w-4 h-4" /> {t.score} {score}
            </div>
            
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 text-purple-400 mb-2 text-sm sm:text-base">
                <Ticket className="w-4 h-4" /> {t.requestTicket}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-medium leading-relaxed">{t.descTicket}</p>
              <TicketRequestForm />
            </div>

            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 text-amber-500 mb-2 text-sm sm:text-base">
                <Landmark className="w-4 h-4" /> {t.requestLoan}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-medium leading-relaxed">{t.descLoan}</p>
              <LoanRequestForm />
            </div>

            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 text-fuchsia-400 mb-2 text-sm sm:text-base">
                <Calendar className="w-4 h-4" /> {t.visits}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-medium">{t.scheduleVisit}</p>
              <VisitForm />
            </div>

            {/* Loan Simulator */}
            <LoanSimulator lang={lang} />
          </div>

        </main>
      </div>
      
      {adminId && <ChatWidget userId={user.id} adminId={adminId} initialMessages={chatMessages} />}
    </div>
  )
}
