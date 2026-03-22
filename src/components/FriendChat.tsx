'use client'

import { useState, useRef } from 'react'
import { Send, Share2, Calendar, Loader2 } from 'lucide-react'
import { sendFriendMessage } from '@/app/friends/actions'
import { formatCOP } from '@/utils/currency'

interface FriendChatProps {
  currentUserId: string
  friendId: string
  friendName: string
  messages: any[]
  myDebts: any[]
  allSharedDebts: any[]  // All debts referenced in shared messages (includes friend's debts)
  lang: 'en' | 'es'
}

const dict = {
  en: {
    msgPh: 'Type a message...',
    send: 'Send',
    shareTitle: 'Share Transactions',
    selectAll: 'Select All',
    noDebts: 'No transactions to share.',
    sharedTx: 'Shared Transactions:',
    close: 'Close',
    sending: 'Sending...'
  },
  es: {
    msgPh: 'Escribe un mensaje...',
    send: 'Enviar',
    shareTitle: 'Compartir Transacciones',
    selectAll: 'Seleccionar Todo',
    noDebts: 'No hay transacciones.',
    sharedTx: 'Transacciones Compartidas:',
    close: 'Cerrar',
    sending: 'Enviando...'
  }
}

export function FriendChat({ currentUserId, friendId, friendName, messages, myDebts, allSharedDebts, lang }: FriendChatProps) {
  const t = dict[lang]
  const [showShare, setShowShare] = useState(false)
  const [selectedDebts, setSelectedDebts] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const toggleDebt = (id: string) => {
    setSelectedDebts(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  const selectAll = () => {
    if (selectedDebts.length === myDebts.length) {
      setSelectedDebts([])
    } else {
      setSelectedDebts(myDebts.map(d => d.id))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (sending) return // prevent double-send
    setSending(true)
    try {
      await sendFriendMessage(formData)
      formRef.current?.reset()
      setSelectedDebts([])
      setShowShare(false) // Auto-close share panel
    } finally {
      setSending(false)
    }
  }

  // Lookup debts from the combined pool (sender + receiver debts)
  const findDebt = (dId: string) => allSharedDebts.find(x => x.id === dId)

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3 sm:p-4">
        {messages.length === 0 && (
          <p className="text-center text-zinc-600 text-sm py-8">👋</p>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUserId
          const hasShared = msg.shared_debt_ids && msg.shared_debt_ids.length > 0
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 rounded-2xl text-sm ${
                isMine ? 'bg-purple-500/20 text-purple-100 border border-purple-500/20' : 'bg-white/5 text-zinc-300 border border-white/10'
              }`}>
                <p className="break-words">{msg.content}</p>
                {hasShared && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-1">{t.sharedTx}</p>
                    {msg.shared_debt_ids.map((dId: string) => {
                      const d = findDebt(dId)
                      return d ? (
                        <div key={dId} className="text-xs text-zinc-400 flex justify-between py-0.5">
                          <span>{d.description}</span>
                          <span className="font-bold text-zinc-300">{formatCOP(d.amount)}</span>
                        </div>
                      ) : (
                        <div key={dId} className="text-xs text-zinc-600">Transaction ({dId.slice(0, 8)}...)</div>
                      )
                    })}
                  </div>
                )}
                <p className="text-[10px] text-zinc-600 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="border-t border-white/10 bg-black/30 p-3 sm:p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs uppercase tracking-widest font-bold text-purple-400">{t.shareTitle}</h4>
            <button onClick={() => setShowShare(false)} className="text-xs text-zinc-500 hover:text-zinc-300">{t.close}</button>
          </div>
          {myDebts.length === 0 ? (
            <p className="text-xs text-zinc-600">{t.noDebts}</p>
          ) : (
            <>
              <button onClick={selectAll} className="text-[10px] uppercase tracking-widest text-purple-500 font-bold mb-2 hover:text-purple-400">
                {t.selectAll}
              </button>
              <div className="space-y-1">
                {myDebts.map(d => (
                  <label key={d.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${selectedDebts.includes(d.id) ? 'bg-purple-500/10 border border-purple-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                    <input type="checkbox" checked={selectedDebts.includes(d.id)} onChange={() => toggleDebt(d.id)} className="accent-purple-500" />
                    <span className="flex-1 text-zinc-300 truncate">{d.description}</span>
                    <span className="text-zinc-500 flex items-center gap-1 shrink-0"><Calendar className="w-2.5 h-2.5" />{new Date(d.created_at).toLocaleDateString()}</span>
                    <span className="font-bold text-zinc-200 shrink-0">{formatCOP(d.amount)}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Message Input */}
      <form ref={formRef} action={handleSubmit} className="border-t border-white/10 p-3 flex gap-2 items-center">
        <input type="hidden" name="receiverId" value={friendId} />
        <input type="hidden" name="sharedDebtIds" value={JSON.stringify(selectedDebts)} />
        <button type="button" onClick={() => setShowShare(!showShare)} className={`p-2 rounded-lg transition-colors shrink-0 ${showShare ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-purple-400 hover:bg-white/5'}`}>
          <Share2 className="w-4 h-4" />
        </button>
        <input
          name="content"
          type="text"
          placeholder={t.msgPh}
          className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-w-0"
        />
        <button type="submit" disabled={sending} className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors shrink-0 disabled:opacity-40">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
