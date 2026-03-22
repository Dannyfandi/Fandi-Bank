import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { sendFriendRequest, respondFriendRequest } from './actions'
import { FriendChat } from '@/components/FriendChat'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ArrowLeft, UserPlus, Users, Check, X, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const dict = {
  en: {
    back: 'Back',
    title: 'Friends',
    subtitle: 'Connect with friends, chat, and share your transactions.',
    addFriend: 'Add Friend',
    addPh: 'Enter username...',
    sendReq: 'Send',
    pending: 'Pending Requests',
    accept: 'Accept',
    decline: 'Decline',
    myFriends: 'My Friends',
    noFriends: 'No friends yet. Add someone by username!',
    noPending: 'No pending requests.',
    chatWith: 'Chat with',
    sentTo: 'Sent to',
    fromUser: 'From',
    waiting: 'Waiting...'
  },
  es: {
    back: 'Volver',
    title: 'Amigos',
    subtitle: 'Conecta con amigos, chatea y comparte tus transacciones.',
    addFriend: 'Agregar Amigo',
    addPh: 'Nombre de usuario...',
    sendReq: 'Enviar',
    pending: 'Solicitudes Pendientes',
    accept: 'Aceptar',
    decline: 'Rechazar',
    myFriends: 'Mis Amigos',
    noFriends: 'Aún no tienes amigos. ¡Agrega a alguien por su nombre!',
    noPending: 'No hay solicitudes.',
    chatWith: 'Chat con',
    sentTo: 'Enviado a',
    fromUser: 'De',
    waiting: 'Esperando...'
  }
}

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = dict[lang]

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const backLink = profile?.role === 'admin' ? '/admin' : '/dashboard'

  // Get all friendships involving this user
  const { data: friendships } = await supabase
    .from('friendships')
    .select('*, requester:profiles!friendships_requester_id_fkey(id, username, avatar_url, description), addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url, description)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const accepted = (friendships || []).filter(f => f.status === 'accepted')
  const pendingIncoming = (friendships || []).filter(f => f.status === 'pending' && f.addressee_id === user.id)
  const pendingOutgoing = (friendships || []).filter(f => f.status === 'pending' && f.requester_id === user.id)

  // Get my debts for sharing
  const { data: myDebts } = await supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

  // Get chat URL param
  const chatFriendParam = null // Handled client-side via URL

  // Pre-fetch messages for all accepted friends
  const friendIds = accepted.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id)
  const { data: allFriendMessages } = await supabase
    .from('friend_messages')
    .select('*')
    .or(friendIds.map(fid => `and(sender_id.eq.${user.id},receiver_id.eq.${fid}),and(sender_id.eq.${fid},receiver_id.eq.${user.id})`).join(',') || 'id.eq.00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link href={backLink} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full border border-white/10">
              <ArrowLeft className="w-4 h-4" /> {t.back}
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" /> {t.title}
            </h1>
          </div>
          <LanguageToggle />
        </header>

        <p className="text-sm text-zinc-400 font-medium">{t.subtitle}</p>

        {/* Add Friend */}
        <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
          <h3 className="font-bold flex items-center gap-2 text-purple-400 mb-3 text-sm sm:text-base">
            <UserPlus className="w-4 h-4" /> {t.addFriend}
          </h3>
          <form action={sendFriendRequest} className="flex gap-2">
            <input name="username" type="text" required placeholder={t.addPh}
              className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-w-0" />
            <button type="submit" className="px-4 sm:px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold rounded-xl text-sm transition-colors border border-purple-500/30 shrink-0">
              {t.sendReq}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pending Requests */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-200">{t.pending}</h3>
            
            {pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
              <p className="text-sm text-zinc-600">{t.noPending}</p>
            )}

            {pendingIncoming.map(f => (
              <div key={f.id} className="p-3 sm:p-4 rounded-xl bg-zinc-900/30 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {f.requester?.avatar_url ? <img src={f.requester.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-200 text-sm truncate block">{f.requester?.username}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.fromUser}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={respondFriendRequest}><input type="hidden" name="friendshipId" value={f.id} /><input type="hidden" name="status" value="accepted" /><button className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30"><Check className="w-3.5 h-3.5" /></button></form>
                  <form action={respondFriendRequest}><input type="hidden" name="friendshipId" value={f.id} /><input type="hidden" name="status" value="rejected" /><button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30"><X className="w-3.5 h-3.5" /></button></form>
                </div>
              </div>
            ))}

            {pendingOutgoing.map(f => (
              <div key={f.id} className="p-3 sm:p-4 rounded-xl bg-zinc-900/30 border border-white/10 flex items-center justify-between gap-3 opacity-60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {f.addressee?.avatar_url ? <img src={f.addressee.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-300 text-sm truncate block">{f.addressee?.username}</span>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{t.sentTo} · {t.waiting}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Friends List */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-200">{t.myFriends}</h3>
            
            {accepted.length === 0 && (
              <p className="text-sm text-zinc-600">{t.noFriends}</p>
            )}

            {accepted.map(f => {
              const friend = f.requester_id === user.id ? f.addressee : f.requester
              const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
              const msgs = (allFriendMessages || []).filter(m =>
                (m.sender_id === user.id && m.receiver_id === friendId) ||
                (m.sender_id === friendId && m.receiver_id === user.id)
              )

              return (
                <details key={f.id} className="rounded-2xl bg-zinc-900/30 border border-white/10 overflow-hidden shadow-lg group/friend">
                  <summary className="cursor-pointer list-none flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30 bg-black flex items-center justify-center shrink-0">
                        {friend?.avatar_url ? <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-zinc-500" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-zinc-200 text-sm truncate block">{friend?.username}</span>
                        {friend?.description && <span className="text-xs text-zinc-500 italic truncate block">"{friend.description}"</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                      {msgs.length > 0 && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">{msgs.length}</span>}
                    </div>
                  </summary>
                  
                  <div className="border-t border-white/10">
                    <FriendChat
                      currentUserId={user.id}
                      friendId={friendId}
                      friendName={friend?.username || ''}
                      messages={msgs}
                      myDebts={myDebts || []}
                      lang={lang}
                    />
                  </div>
                </details>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
