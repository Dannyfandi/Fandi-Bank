'use client'

import { useState } from 'react'
import { Search, UserPlus, User, Loader2 } from 'lucide-react'
import { sendFriendRequest } from '@/app/friends/actions'

interface FriendSearchProps {
  lang: 'en' | 'es'
}

const dict = {
  en: {
    addFriend: 'Add Friend',
    searchPh: 'Search by username...',
    search: 'Search',
    searching: 'Searching...',
    noResults: 'No users found with that name.',
    sendReq: 'Add',
    sending: 'Adding...',
    sent: 'Sent!'
  },
  es: {
    addFriend: 'Agregar Amigo',
    searchPh: 'Buscar por nombre de usuario...',
    search: 'Buscar',
    searching: 'Buscando...',
    noResults: 'No se encontraron usuarios.',
    sendReq: 'Agregar',
    sending: 'Agregando...',
    sent: '¡Enviado!'
  }
}

export function FriendSearchPreview({ lang }: FriendSearchProps) {
  const t = dict[lang]
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sentIds, setSentIds] = useState<string[]>([])
  const [sendingId, setSendingId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim() || searching) return
    setSearching(true)
    setSearched(false)
    try {
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      setResults(data.users || [])
    } catch {
      setResults([])
    }
    setSearched(true)
    setSearching(false)
  }

  const handleAdd = async (username: string, userId: string) => {
    if (sendingId) return
    setSendingId(userId)
    const fd = new FormData()
    fd.set('username', username)
    await sendFriendRequest(fd)
    setSentIds(prev => [...prev, userId])
    setSendingId(null)
  }

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
      <h3 className="font-bold flex items-center gap-2 text-purple-400 mb-3 text-sm sm:text-base">
        <UserPlus className="w-4 h-4" /> {t.addFriend}
      </h3>
      
      {/* Search Input */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t.searchPh}
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold rounded-xl text-sm transition-colors border border-purple-500/30 shrink-0 disabled:opacity-40"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : t.search}
        </button>
      </div>

      {/* Results */}
      {searched && results.length === 0 && (
        <p className="text-xs text-zinc-600 py-2">{t.noResults}</p>
      )}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/20 bg-black flex items-center justify-center shrink-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-zinc-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-zinc-200 text-sm truncate block">{u.username}</span>
                  {u.description && <span className="text-xs text-zinc-500 italic truncate block">"{u.description}"</span>}
                </div>
              </div>
              <button
                onClick={() => handleAdd(u.username, u.id)}
                disabled={sentIds.includes(u.id) || sendingId === u.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  sentIds.includes(u.id) 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                } disabled:opacity-60`}
              >
                {sentIds.includes(u.id) ? t.sent : sendingId === u.id ? t.sending : t.sendReq}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
