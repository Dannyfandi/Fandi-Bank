import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { QuickPayButton } from '@/components/QuickPayButton'
import { TicketRequestForm } from '@/components/TicketRequestForm'
import { VisitForm } from '@/components/VisitForm'
import { LoanRequestForm } from '@/components/LoanRequestForm'
import { ChatWidget } from '@/components/ChatWidget'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Receipt, Calendar, CreditCard, Ticket, Wallet, Sparkles, ChevronDown, Landmark, Star, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { formatCOP } from '@/utils/currency'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, credit_balance')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    return redirect('/admin')
  }

  // Fetch debts
  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate Credit Score dynamically based on debts
  const { score, isSuspended } = calculateCreditScore((debts || []) as DebtForCredit[])

  // Fetch ALL payment allocations for expanding dropdowns
  const { data: allocations } = await supabase
    .from('payment_allocations')
    .select('*, payments(created_at)')
    .in('debt_id', debts?.map(d => d.id) || [])

  // Find Admin ID for Chatting
  const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').single()
  const adminId = adminProfile?.id

  // Fetch Message History
  let chatMessages: any[] = []
  if (adminId) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    if (msgs) chatMessages = msgs
  }

  // Calculate actual remaining values
  const pendingDebts = debts?.filter(d => d.status === 'pending') || []
  const totalOwed = pendingDebts.reduce((acc, debt) => {
    const interest = calculateDebtInterest(debt as DebtForCredit)
    const remaining = (Number(debt.amount) + interest) - Number(debt.paid_amount || 0)
    return acc + (remaining > 0 ? remaining : 0)
  }, 0)

  const creditBalance = Number(profile?.credit_balance || 0)

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-4 md:p-8 font-sans">

      {isSuspended && (
        <div className="max-w-5xl mx-auto mb-8 p-6 bg-red-950/80 border-2 border-red-500 rounded-2xl flex items-center gap-4 shadow-xl shadow-red-500/20 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-red-200 font-black text-lg uppercase tracking-widest">Urgent Suspension Warning</p>
            <p className="text-red-300/80 font-bold">
              You have a past-due debt that is over 180 days old. You are facing a rigid 2-month suspension from Fandi Bank unless cleared immediately.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 relative hidden sm:block">
               <Image src="/logo.png" alt="Fandi Bank Logo" fill className="object-cover rounded-full shadow-lg" priority />
             </div>
             <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
               Fandi Bank
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <div className={`px-4 py-1.5 rounded-full border text-sm font-black flex items-center gap-2 ${score >= 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
               <Star className="w-4 h-4" /> Score: {score}
            </div>
            <span className="text-sm font-medium text-zinc-400 bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 px-3 py-1 rounded-full border border-white/10">
              {profile?.username || user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button className="text-sm font-bold text-purple-500 hover:text-purple-400 transition-colors">
                Log out
              </button>
            </form>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Total Owed Card */}
            <div className="p-8 border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    <h2 className="text-sm font-semibold uppercase tracking-widest">Total Owed Remaining</h2>
                  </div>
                  {creditBalance > 0 && (
                    <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">
                      <Wallet className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Credit: {formatCOP(creditBalance)}</span>
                    </div>
                  )}
                </div>
                <p className="text-5xl sm:text-7xl font-black text-purple-400 tracking-tighter mt-4 break-words">
                  {formatCOP(totalOwed)}
                </p>
                {pendingDebts.length === 0 ? (
                  <p className="mt-4 text-purple-500/60 font-medium tracking-wide">You're all settled up! 🎉</p>
                ) : (
                  <p className="mt-4 text-zinc-500 font-medium tracking-wide">Across {pendingDebts.length} pending expense{pendingDebts.length !== 1 ? 's' : ''}. Includes pending interests.</p>
                )}
              </div>
            </div>

            {/* Quick Pay Action */}
            <QuickPayButton />

            {/* Debt History */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-6">
                <Receipt className="w-5 h-5 text-purple-500" />
                Individual Debt History
              </h3>
              
              <div className="border border-white/10 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150/50 overflow-hidden shadow-xl">
                {(!debts || debts.length === 0) ? (
                  <div className="p-8 text-center text-zinc-500 font-medium">No history found.</div>
                ) : (
                  <ul className="divide-y divide-neutral-800/50">
                    {debts.map((debt) => {
                      const amount = Number(debt.amount)
                      const interest = calculateDebtInterest(debt as DebtForCredit)
                      const totalDue = amount + interest
                      const paid = Number(debt.paid_amount || 0)
                      const remaining = totalDue - paid
                      const debtAllocs = allocations?.filter(a => a.debt_id === debt.id) || []
                      
                      return (
                        <li key={debt.id} className="hover:bg-neutral-800/20 transition-colors">
                          <details className="group">
                            <summary className="p-4 sm:p-6 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-transparent hover:bg-neutral-800/30 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-zinc-100 text-lg">{debt.description}</p>
                                  {debtAllocs.length > 0 && (
                                    <ChevronDown className="w-4 h-4 text-purple-500 group-open:rotate-180 transition-transform" />
                                  )}
                                  {debt.is_loan && (
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Loan</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(debt.created_at).toLocaleDateString()}
                                </div>
                                <div className="text-sm font-medium mt-1">
                                  <span className="text-zinc-400">Initial Request: {formatCOP(amount)}</span>
                                  {interest > 0 && <span className="ml-2 text-amber-500/80 font-bold block sm:inline">(+{formatCOP(interest)} Interest)</span>}
                                  {paid > 0 && <span className="mt-1 sm:mt-0 sm:ml-3 text-purple-500/80 tracking-wide font-bold block sm:inline">({formatCOP(paid)} PAID)</span>}
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <p className={`font-black tracking-tighter text-2xl ${debt.status === 'paid' ? 'text-zinc-600' : 'text-purple-400'}`}>
                                  {formatCOP(debt.status === 'paid' ? 0 : remaining)}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                  <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                                    debt.status === 'paid' 
                                      ? 'bg-neutral-800/50 text-zinc-500 border-zinc-700'
                                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  }`}>
                                    {debt.status}
                                  </span>
                                </div>
                              </div>
                            </summary>

                            {debtAllocs.length > 0 && (
                              <div className="px-6 pb-6 pt-2">
                                <div className="p-4 bg-transparent rounded-xl border border-white/10 space-y-3">
                                  <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Payment History For This Debt
                                  </h4>
                                  {debtAllocs.map(alloc => (
                                    <div key={alloc.id} className="flex justify-between items-center text-sm border-b border-white/10/50 last:border-0 pb-2 last:pb-0">
                                      <span className="text-zinc-400 font-medium">
                                        Received on {new Date(alloc.payments?.created_at || alloc.created_at).toLocaleDateString()}
                                      </span>
                                      <span className="text-purple-400 font-bold tracking-wide">
                                        +{formatCOP(alloc.allocated_amount)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center text-sm uppercase tracking-widest font-black">
                                    <span className="text-purple-500/50">Total Paid</span>
                                    <span className="text-purple-500">{formatCOP(paid)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </details>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
            
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="p-6 border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
               <div className="relative z-10 space-y-6">
                 <div>
                   <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-2">
                    <Landmark className="w-5 h-5 text-amber-500" />
                    Request a Loan
                   </h3>
                 </div>
                 <LoanRequestForm />
               </div>
            </div>

            <div className="p-6 border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-[60px] -mr-24 -mb-24 pointer-events-none" />
               <div className="relative z-10 space-y-6">
                 <div>
                   <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-fuchsia-400" />
                    Concert Tickets
                   </h3>
                   <p className="mt-2 text-sm text-zinc-400">
                     Want Fandi to buy a ticket for you? Submit a request here.
                   </p>
                 </div>
                 
                 <TicketRequestForm />
               </div>
            </div>

            <div className="p-6 border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
               <div className="relative z-10 space-y-6">
                 <div>
                   <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    MojoDojoCasaHouse
                   </h3>
                   <p className="mt-2 text-sm text-zinc-400">
                     Schedule your next visit! Add your ETA and stay plan.
                   </p>
                 </div>
                 <VisitForm />
               </div>
            </div>
          </div>

        </main>
      </div>
      
      {adminId && <ChatWidget userId={user.id} adminId={adminId} initialMessages={chatMessages} />}
    </div>
  )
}
