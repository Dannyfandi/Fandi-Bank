import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createDebt, createPayment, deleteDebt, markDebtPaid, updateTicketRequestStatus, updateLoanStatus } from './actions'
import { User, Receipt, Shield, Check, X, Ticket, Sparkles, MapPin, Wallet, ChevronDown, Landmark, Star } from 'lucide-react'
import Image from 'next/image'
import { formatCOP } from '@/utils/currency'
import { AdminParser } from '@/components/AdminParser'
import { AdminHelpCenter } from '@/components/AdminHelpCenter'
import { LanguageToggle } from '@/components/LanguageToggle'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return redirect('/dashboard')

  // Fetch all users
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  
  // Fetch all debts
  const { data: debts } = await supabase
    .from('debts')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })

  // Fetch ALL payment allocations for expanding dropdowns
  const { data: allocations } = await supabase
    .from('payment_allocations')
    .select('*, payments(created_at, total_amount)')

  // Fetch all ticket requests
  const { data: requests } = await supabase
    .from('ticket_requests')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })

  // Fetch all visit requests
  const { data: visits } = await supabase
    .from('visit_requests')
    .select('*, profiles(username)')
    .order('visit_date', { ascending: true })

  // Fetch all loan requests
  const { data: loans } = await supabase
    .from('loan_requests')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })

  // Fetch all messages for Help Center
  const { data: allMessages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  // Calculate aggregated totals & CREDIT SCORES
  let grandTotal = 0
  const userTotals = (profiles || []).map(p => {
    const userDebts = (debts || []).filter(d => d.user_id === p.id)
    const pendingDebts = userDebts.filter(d => d.status === 'pending')
    
    // Evaluate Credit Score explicitly for this user's entire debt history
    const { score, isSuspended } = calculateCreditScore(userDebts as DebtForCredit[])

    let totalRemaining = 0
    pendingDebts.forEach(pd => {
      const interest = calculateDebtInterest(pd as DebtForCredit)
      totalRemaining += ((Number(pd.amount) + interest) - Number(pd.paid_amount || 0))
    })
    grandTotal += totalRemaining
    return { ...p, totalRemaining, debts: userDebts, score, isSuspended }
  })

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative">
               <Image src="/logo.png" alt="Fandi Bank Logo" fill className="object-cover rounded-full shadow-lg" priority />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-600 bg-clip-text text-transparent">
                Admin HQ
              </h1>
              <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Fandi Bank</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <span className="text-sm font-medium text-violet-400">{profile?.username}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm font-bold text-zinc-400 hover:text-zinc-300 transition-colors">
                Log out
              </button>
            </form>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Create Debt, Create Payment, Requests */}
          <div className="space-y-8 lg:col-span-1">
            <AdminParser users={profiles || []} />

            <div className="flex flex-col gap-4">
              {/* Add Manual Debt */}
              <div className="p-6 border border-red-500/20 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-xl">
                 <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
                   <Receipt className="w-4 h-4 text-red-500" />
                   Add Manual Debt
                 </h2>
                 <form action={createDebt} className="space-y-3">
                   <select name="userId" required className="w-full px-3 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none">
                     <option value="">Select User...</option>
                     {profiles?.map(p => <option key={p.id} value={p.id}>{p.username || p.email}</option>)}
                   </select>
                   <input name="description" type="text" required placeholder="Description (e.g. Dinner)" className="w-full px-3 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none" />
                   <input name="amount" type="number" required placeholder="Amount (COP)" className="w-full px-3 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-red-500 outline-none" />
                   <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold rounded-lg text-sm transition-all border border-red-500/10">Add Debt</button>
                 </form>
              </div>

              {/* Add Manual Payment */}
              <div className="p-6 border border-purple-500/20 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-xl">
                 <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
                   <Wallet className="w-4 h-4 text-purple-500" />
                   Add Manual Payment
                 </h2>
                 <form action={createPayment} className="space-y-3">
                   <select name="userId" required className="w-full px-3 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-purple-500 outline-none">
                     <option value="">Select User...</option>
                     {profiles?.map(p => <option key={p.id} value={p.id}>{p.username || p.email}</option>)}
                   </select>
                   <input name="description" type="text" placeholder="Description (Optional)" className="w-full px-3 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-purple-500 outline-none" />
                   <input name="amount" type="number" required placeholder="Amount (COP)" className="w-full px-3 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-zinc-100 focus:ring-1 focus:ring-purple-500 outline-none" />
                   <button className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 font-bold rounded-lg text-sm transition-all border border-purple-500/10">Log Payment</button>
                 </form>
              </div>
            </div>

            {/* Loan Requests Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-500" />
                Loan Requests
              </h3>
              
              <div className="space-y-3">
                {(!loans || loans.length === 0) && (
                  <p className="text-zinc-500 text-sm">No loan requests.</p>
                )}
                {loans?.map(req => (
                  <div key={req.id} className="p-4 border border-white/10 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-zinc-200">{req.profiles?.username}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                          req.status === 'approved' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                          req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-lg font-black text-amber-500 mb-4 break-words">{formatCOP(req.amount)}</p>
                    </div>
                    
                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-auto">
                         <form action={updateLoanStatus} className="flex-1">
                           <input type="hidden" name="loanId" value={req.id} />
                           <input type="hidden" name="status" value="approved" />
                           <button className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors border border-purple-500/30">
                             Approve
                           </button>
                         </form>
                         <form action={updateLoanStatus} className="flex-1">
                           <input type="hidden" name="loanId" value={req.id} />
                           <input type="hidden" name="status" value="rejected" />
                           <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/30">
                             Reject
                           </button>
                         </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Requests Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-400" />
                Ticket Requests
              </h3>
              
              <div className="space-y-3">
                {(!requests || requests.length === 0) && (
                  <p className="text-zinc-500 text-sm">No ticket requests found.</p>
                )}
                {requests?.map(req => (
                  <div key={req.id} className="p-4 border border-white/10 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-zinc-200">{req.profiles?.username}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                          req.status === 'approved' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                          req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-4 break-words">{req.event_name}</p>
                    </div>
                    
                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-auto">
                         <form action={updateTicketRequestStatus} className="flex-1">
                           <input type="hidden" name="reqId" value={req.id} />
                           <input type="hidden" name="status" value="approved" />
                           <button className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold transition-colors border border-purple-500/30">
                             Approve
                           </button>
                         </form>
                         <form action={updateTicketRequestStatus} className="flex-1">
                           <input type="hidden" name="reqId" value={req.id} />
                           <input type="hidden" name="status" value="rejected" />
                           <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/30">
                             Reject
                           </button>
                         </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visit Requests Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-fuchsia-400" />
                House Visits
              </h3>
              
              <div className="space-y-3">
                {(!visits || visits.length === 0) && (
                  <p className="text-zinc-500 text-sm">No visits requested.</p>
                )}
                {visits?.map(visit => (
                  <div key={visit.id} className="p-4 border border-white/10 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-zinc-200">{visit.profiles?.username}</span>
                      <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300">
                      <strong>ETA:</strong> {visit.arrival_time.slice(0, 5)}
                    </p>
                    <p className="text-sm text-fuchsia-400 font-medium break-words mt-1">
                      {visit.stay_status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Global Debt Tracking */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <User className="w-6 h-6 text-violet-500" />
              Total Debt Tracking Per User
            </h2>

            {/* GRAND TOTAL */}
            <div className="p-8 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-500/5 mb-8">
              <p className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Grand Total Owed To Fandi Bank
              </p>
              <p className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tracking-tighter">
                {formatCOP(grandTotal)}
              </p>
            </div>

            {/* Aggregated Totals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {userTotals.map(u => {
                const total = u.totalRemaining
                const formatted = total === 0 ? '$0' : formatCOP(total)
                const credits = Number(u.credit_balance || 0)
                
                return (
                  <div key={u.id} className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden ${
                    u.isSuspended ? 'bg-red-950/40 border-red-500' :
                    total > 0 ? 'bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 border-red-500/20 shadow-red-500/5' : 
                    credits > 0 ? 'bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 border-purple-500/30 shadow-purple-500/5' : 
                    'bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 border-white/10'
                  }`}>
                    {u.isSuspended && <div className="absolute top-0 right-0 bg-red-500 text-red-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-widest">Suspended</div>}
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-zinc-200 text-lg truncate pr-2">{u.username || u.email}</h3>
                      <div className={`px-2 py-1 rounded-lg border text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${u.score >= 0 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <Star className="w-3 h-3" /> Score {u.score}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Owed Pending</p>
                      <p className={`text-4xl font-black ${total > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                        {formatted}
                      </p>
                    </div>
                    {credits > 0 && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                        <Wallet className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">+ {formatCOP(credits)} Credit</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Individual Debts List */}
            <h2 className="text-xl font-bold flex items-center gap-3 mt-12 pt-8 border-t border-white/10">
              <Receipt className="w-5 h-5 text-zinc-500" />
              Individual Debt Receipts
            </h2>

            <div className="border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 overflow-hidden shadow-2xl">
              {(!debts || debts.length === 0) ? (
                <div className="p-12 text-center text-zinc-500">No individual debts found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-transparent/50">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Initial Amount / Paid</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {debts.map(debt => {
                        const amount = Number(debt.amount)
                        const paid = Number(debt.paid_amount || 0)
                        const interest = calculateDebtInterest(debt as DebtForCredit)
                        const debtAllocs = allocations?.filter(a => a.debt_id === debt.id) || []
                        
                        return (
                          <tr key={debt.id} className="hover:bg-neutral-800/30 transition-colors group/row">
                            <td className="p-4 font-medium text-zinc-300">{debt.profiles?.username}</td>
                            <td className="p-4 text-zinc-400">
                              <details className="group/details">
                                <summary className="cursor-pointer font-bold list-none flex items-center gap-2 hover:text-fuchsia-400 transition-colors">
                                  {debt.description}
                                  {debt.is_loan && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] uppercase tracking-widest font-black ml-2">Loan</span>}
                                  {debtAllocs.length > 0 && <ChevronDown className="w-3 h-3 text-zinc-500 group-open/details:rotate-180 transition-transform" />}
                                </summary>
                                {debtAllocs.length > 0 && (
                                  <div className="mt-3 p-3 bg-transparent rounded border border-white/10 space-y-2">
                                    <div className="text-[10px] uppercase tracking-widest text-purple-500 font-bold mb-1">Payment History</div>
                                    {debtAllocs.map(alloc => (
                                      <div key={alloc.id} className="flex justify-between text-xs text-zinc-400 border-b border-white/10/50 last:border-0 pb-1 last:pb-0">
                                        <span>{new Date(alloc.payments?.created_at || alloc.created_at).toLocaleDateString()}</span>
                                        <span className="font-bold text-purple-400">+{formatCOP(alloc.allocated_amount)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </details>
                            </td>
                            <td className="p-4 font-black tracking-tighter text-zinc-200">
                               <div className="text-sm font-semibold text-zinc-500">Initial: {formatCOP(amount)}</div>
                               {interest > 0 && <div className="text-[10px] text-amber-500 mt-0.5 font-bold">+{formatCOP(interest)} Interest</div>}
                               <div className={`mt-1 ${paid >= (amount + interest) ? 'text-purple-500' : 'text-purple-500/60'}`}>
                                 Paid: {formatCOP(paid)}
                               </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                                debt.status === 'paid' 
                                  ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {debt.status}
                              </span>
                            </td>
                            <td className="p-4 flex items-center justify-end gap-2">
                              {debt.status === 'pending' && (
                                <form action={markDebtPaid}>
                                  <input type="hidden" name="debtId" value={debt.id} />
                                  <button 
                                    title="Quick Mark Fully Paid"
                                    className="p-2 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                </form>
                              )}
                              <form action={deleteDebt}>
                                <input type="hidden" name="debtId" value={debt.id} />
                                <button 
                                  title="Delete Debt completely"
                                  className="p-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </form>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
        </main>

        <div className="pt-8">
           <AdminHelpCenter adminId={user.id} users={profiles || []} messages={allMessages || []} />
        </div>
      </div>
    </div>
  )
}
