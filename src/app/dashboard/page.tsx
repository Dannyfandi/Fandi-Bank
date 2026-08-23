import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { ThemeSettings } from '@/components/ThemeSettings'
import { ChatWidget } from '@/components/ChatWidget'
import { LanguageToggle } from '@/components/LanguageToggle'
import { MobileNav } from '@/components/MobileNav'
import { DashboardClient } from '@/components/DashboardClient'
import { ExperimentalTab } from '@/components/ExperimentalTab'
import { GamesTab } from '@/components/GamesTab'
import { EventInvitationsClient } from '@/components/EventInvitationsClient'
import { SubmitButton } from '@/components/SubmitButton'
import { QuickActionGrid } from '@/components/QuickActionGrid'
import { BottomNav } from '@/components/BottomNav'
import { ShopSection } from '@/components/ShopSection'
import { ThemeToggleWidget } from '@/components/ThemeToggleWidget'
import {
  Star,
  User,
  Users,
  MapPin,
  Clock,
  HelpCircle,
  X,
  Lightbulb,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { calculateCreditScore, calculateDebtInterest, DebtForCredit } from '@/utils/credit'
import { cancelVisitRequest } from './actions'

const sideDict = {
  en: {
    actions: 'Quick Actions',
    requestTicket: 'Request Ticket',
    descTicket: 'Want to go to a concert? Fandi Bank secures it at presale price!',
    requestLoan: 'Request Loan',
    descLoan: 'Need cash fast? Request up to $500,000 COP with simple 0.051% daily interest.',
    visits: 'Mojo Dojo Casa House',
    scheduleVisit: 'Schedule an upcoming visit to HQ.',
    logout: 'Log Out',
    score: 'Score:',
    myVisits: 'My Visit Requests',
    noVisits: 'No visit requests yet.',
    pending: 'Pending',
    approved: 'Approved',
    cancelVisit: 'Cancel Visit',
  },
  es: {
    actions: 'Acciones Rápidas',
    requestTicket: 'Pedir Entrada',
    descTicket: '¿Quieres ir a un concierto? ¡Fandi Bank lo compra en preventa por ti!',
    requestLoan: 'Pedir Préstamo',
    descLoan: '¿Necesitas efectivo? Pide hasta $500.000 COP con interés simple diario de 0.051%.',
    visits: 'Visitas Mojo Dojo Casa House',
    scheduleVisit: 'Programa una visita a la casa.',
    logout: 'Salir',
    score: 'Puntos:',
    myVisits: 'Mis Solicitudes de Visita',
    noVisits: 'No hay solicitudes.',
    pending: 'Pendiente',
    approved: 'Aprobado',
    cancelVisit: 'Cancelar',
  },
}

function LoadingBlock() {
  return <div className="p-6 rounded-3xl glass-panel animate-pulse h-36" />
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = sideDict[lang]

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: allocations } = await supabase
    .from('payment_allocations')
    .select('*, payments(created_at)')
    .in('debt_id', debts?.map((d) => d.id) || [])

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .single()
  const adminId = adminProfile?.id

  let chatMessages: any[] = []
  if (adminId) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
    if (msgs) chatMessages = msgs
  }

  // Fetch visit requests
  const { data: visits } = await supabase
    .from('visit_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('visit_date', { ascending: false })

  // Fetch event invitations
  const { data: invitations } = await supabase
    .from('event_invitations')
    .select('*, events(*)')
    .eq('user_id', user.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })

  // Fetch all user profiles for friend invitations in Suggest Event
  const { data: allUsers } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .order('username', { ascending: true })

  let { score, isSuspended } = calculateCreditScore((debts || []) as DebtForCredit[])

  // Add Gamification points
  const sfRandoms = profile?.sf_progress?.randoms_smiled || 0
  const sfUnlocked = profile?.sf_progress?.unlocked_mains?.length || 0
  score += sfRandoms * 15 + sfUnlocked * 200 + (sfUnlocked === 6 ? 50 : 0)

  // Add Manual Admin Modifiers
  score += profile?.manual_score_modifier || 0

  const interestMap: Record<string, number> = {}
  let totalOwed = 0
  for (const debt of debts || []) {
    const interest = calculateDebtInterest(debt as DebtForCredit)
    interestMap[debt.id] = interest
    if (debt.status === 'pending') {
      totalOwed += Number(debt.amount) + interest - Number(debt.paid_amount || 0)
    }
  }

  const credits = Number(profile?.credit_balance || 0)
  const isSmiling = profile?.active_theme === 'smiling_friends'
  const isStarWars = profile?.active_theme === 'star_wars'
  const logoSrc = isStarWars ? '/sw_logo.svg' : isSmiling ? '/sf_logo.png' : '/logo.png'

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-5 md:p-8 pb-28 sm:pb-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Condensed Header */}
        <header className="flex items-center justify-between pb-4 border-b border-white/10 glass-panel px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 relative shrink-0">
              <Image
                src={logoSrc}
                alt="Fandi Bank"
                fill
                className="object-cover rounded-full shadow-lg shadow-purple-900/40"
                priority
              />
            </div>
            {/* Score Pill in Header */}
            <div
              className={`flex px-3 py-1 rounded-full border text-xs sm:text-sm font-black items-center gap-1.5 ${
                score >= 0
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : 'bg-red-500/15 text-red-300 border-red-500/30'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{score} pts</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />

            {/* Mobile Hamburger Menu */}
            <MobileNav profile={profile} t={t} isAdminPanel={false} />

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
                <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-500/40 bg-black flex items-center justify-center shadow-md">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-200 hidden md:block">
                  {profile?.username || 'Profile'}
                </span>
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] uppercase font-black tracking-wider transition-colors shrink-0"
                >
                  Admin Panel
                </Link>
              )}
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

        {/* Main Content Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events Horizontal Carousel */}
            <EventInvitationsClient invitations={invitations || []} lang={lang} />

            {/* Dashboard Client: Balance & Debts List */}
            <Suspense fallback={<LoadingBlock />}>
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
            </Suspense>
          </div>

          {/* Sidebar Column (Quick Actions & Visits) */}
          <div className="space-y-6">
            {/* Quick Action Grid (Slide-up Drawer Triggers) */}
            <QuickActionGrid lang={lang} t={t} />

            {/* My Visit Requests */}
            {visits && visits.length > 0 && (
              <details open className="glass-panel rounded-[28px] p-5 shadow-xl border border-white/10 space-y-3">
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-bold text-zinc-200 select-none">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-fuchsia-400" />
                    <span>{t.myVisits}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      {visits.length}
                    </span>
                  </div>
                </summary>
                <div className="space-y-2 pt-2">
                  {visits.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-200 font-semibold">
                          {new Date(v.visit_date).toLocaleDateString()}
                        </span>
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {v.arrival_time?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span
                          className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${
                            v.status === 'approved'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {v.status === 'approved' ? t.approved : t.pending}
                        </span>
                        <form action={cancelVisitRequest}>
                          <input type="hidden" name="visitId" value={v.id} />
                          <SubmitButton
                            title={t.cancelVisit}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors touch-feedback"
                          >
                            <X className="w-3 h-3" />
                          </SubmitButton>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </main>

        {/* Games & Themes Section */}
        <GamesTab
          lang={lang}
          initialProgress={profile?.sf_progress}
          initialCoins={profile?.fandi_coins || 0}
          initialVersion={profile?.coin_sync_version || 0}
        />

        {/* Dedicated Shop & Rewards Section */}
        <ShopSection userCoins={profile?.fandi_coins || 0} lang={lang} />

        {/* Experimental Tab */}
        <ExperimentalTab lang={lang} />

        {/* Footer */}
        <footer className="mt-16 pt-8 pb-8 border-t border-white/10 text-center px-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">
              © 2026 Fandi Bank
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed">
              <strong>Terms & Conditions:</strong> If you don&apos;t pay, Mr. Frog will find you.
              Not insured by Fogafín, but we promise we won&apos;t buy crypto with your money (probably).
              <br />
              <br />
              <strong>Warning:</strong> Late payments will be aggressively reported to Datacrédito,
              your mom, and the panadero from your neighborhood. Don&apos;t give papaya.
            </p>
            <div className="text-[10px] text-zinc-600 font-black tracking-widest uppercase mt-4">
              &quot;El banco de los que no tienen banco... ni plata.&quot;
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Mobile Bottom Navigation Bar */}
      <BottomNav
        role={profile?.role}
        lang={lang}
        hasEvents={!!(invitations && invitations.length > 0)}
        friendsList={allUsers || []}
      />

      {/* Floating Theme Selector on the Left */}
      <ThemeToggleWidget
        activeTheme={profile?.active_theme || 'normal'}
        hasSmilingFriends={(profile?.sf_progress?.unlocked_mains?.length || 0) >= 6}
        hasStarWars={profile?.active_theme === 'star_wars' || ((profile?.sf_progress?.unlocked_mains?.length || 0) >= 6)}
      />

      {/* Support Chat Floating Widget on the Right */}
      {adminId && (
        <div className="mb-14 sm:mb-0">
          <ChatWidget userId={user.id} adminId={adminId} initialMessages={chatMessages} />
        </div>
      )}
    </div>
  )
}
