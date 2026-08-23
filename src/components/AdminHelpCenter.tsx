'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, User, ArrowLeft, Bot } from 'lucide-react'
import { sendMessage } from '@/app/chat/actions'

export function AdminHelpCenter({
  adminId,
  users,
  messages,
}: {
  adminId: string
  users: any[]
  messages: any[]
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeMessages = messages.filter(
    (m) => m.sender_id === selectedUserId || m.receiver_id === selectedUserId
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedUserId, activeMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !selectedUserId) return
    setLoading(true)
    const fd = new FormData()
    fd.append('content', content)
    fd.append('receiverId', selectedUserId)
    await sendMessage(fd)
    setContent('')
    setLoading(false)
  }

  const userIdsWithMsgs = Array.from(
    new Set(
      messages.map((m) =>
        m.sender_id === adminId ? m.receiver_id : m.sender_id
      )
    )
  )
  const activeUsers = users.filter((u) => userIdsWithMsgs.includes(u.id))

  const sortedUsers = activeUsers.sort((a, b) => {
    const aMsgs = messages.filter(
      (m) => m.sender_id === a.id || m.receiver_id === a.id
    )
    const bMsgs = messages.filter(
      (m) => m.sender_id === b.id || m.receiver_id === b.id
    )
    const aLastTime =
      aMsgs.length > 0 ? new Date(aMsgs[aMsgs.length - 1].created_at).getTime() : 0
    const bLastTime =
      bMsgs.length > 0 ? new Date(bMsgs[bMsgs.length - 1].created_at).getTime() : 0
    return bLastTime - aLastTime
  })

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <div className="h-[520px] sm:h-[580px] border border-white/10 rounded-[32px] glass-panel-heavy shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row">
      {/* Sidebar / Conversation List */}
      <div
        className={`w-full md:w-1/3 border-r border-white/10 flex flex-col bg-black/40 ${
          selectedUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-transparent flex items-center justify-between">
          <h3 className="font-black text-purple-300 flex items-center gap-2.5 tracking-tight text-base sm:text-lg text-shadow-sm">
            <MessageCircle className="w-5 h-5 text-purple-400" /> Mensajes de Usuarios
          </h3>
          <span className="text-[10px] uppercase tracking-widest font-black text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
            {sortedUsers.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {sortedUsers.map((u) => {
            const isSelected = selectedUserId === u.id
            const lastMsg = messages
              .filter((m) => m.sender_id === u.id || m.receiver_id === u.id)
              .pop()

            return (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left p-3.5 sm:p-4 transition-all flex items-center gap-3 touch-feedback ${
                  isSelected
                    ? 'bg-purple-900/30 border-l-4 border-purple-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex shrink-0 items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-purple-500 text-black border-purple-400 shadow-md'
                      : 'bg-white/5 text-zinc-400 border-white/10'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                    {u.username || u.email}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
                    {lastMsg?.content || 'Inició un chat'}
                  </div>
                </div>
              </button>
            )
          })}
          {sortedUsers.length === 0 && (
            <div className="p-8 text-xs text-zinc-500 text-center uppercase tracking-widest font-bold">
              No hay conversaciones activas
            </div>
          )}
        </div>
      </div>

      {/* Chat Conversation View */}
      {selectedUserId ? (
        <div className="w-full md:flex-1 flex flex-col bg-black/50">
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUserId(null)}
                className="md:hidden p-2 hover:bg-white/10 rounded-xl text-zinc-300 transition-colors touch-feedback"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-100 text-xs sm:text-sm">
                  {selectedUser?.username || selectedUser?.email}
                </h4>
                <p className="text-[10px] text-emerald-400 font-bold">En línea</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 custom-scrollbar">
            {activeMessages.map((msg) => {
              const isMe = msg.sender_id === adminId
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs sm:text-sm font-medium shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-br-none'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-white/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-widest px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-white/10 bg-black/40 flex gap-2"
          >
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="flex-1 px-4 py-2.5 glass-input rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 text-white font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-md touch-feedback shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Enviar
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-sm text-zinc-500 space-y-3">
          <MessageCircle className="w-12 h-12 opacity-20 text-purple-400" />
          <p className="tracking-wider uppercase font-bold text-xs">
            Selecciona un usuario para ver la conversación
          </p>
        </div>
      )}
    </div>
  )
}
