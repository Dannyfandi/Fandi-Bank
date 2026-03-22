'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, User } from 'lucide-react'
import { sendMessage } from '@/app/chat/actions'

export function AdminHelpCenter({ adminId, users, messages }: { adminId: string, users: any[], messages: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeMessages = messages.filter(m => m.sender_id === selectedUserId || m.receiver_id === selectedUserId)

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

  // Find users who have sent or received messages
  const userIdsWithMsgs = Array.from(new Set(messages.map(m => m.sender_id === adminId ? m.receiver_id : m.sender_id)))
  const activeUsers = users.filter(u => userIdsWithMsgs.includes(u.id))

  // Find latest message time per user for sorting
  const sortedUsers = activeUsers.sort((a, b) => {
    const aMsgs = messages.filter(m => m.sender_id === a.id || m.receiver_id === a.id)
    const bMsgs = messages.filter(m => m.sender_id === b.id || m.receiver_id === b.id)
    const aLastTime = aMsgs.length > 0 ? new Date(aMsgs[aMsgs.length - 1].created_at).getTime() : 0
    const bLastTime = bMsgs.length > 0 ? new Date(bMsgs[bMsgs.length - 1].created_at).getTime() : 0
    return bLastTime - aLastTime
  })

  return (
    <div className="flex h-[600px] border border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-2xl overflow-hidden mt-12 mb-12 relative z-10">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-white/10 bg-transparent/50 flex flex-col min-w-[200px]">
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/5 to-transparent">
          <h3 className="font-black text-purple-400 flex items-center gap-3 tracking-tighter text-xl">
            <MessageCircle className="w-6 h-6" /> Live Inbox
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedUsers.map(u => {
            const isSelected = selectedUserId === u.id
            const lastMsg = messages.filter(m => m.sender_id === u.id || m.receiver_id === u.id).pop()

            return (
              <button 
                key={u.id} 
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left p-4 border-b border-white/10/50 transition-all flex items-center gap-4 ${isSelected ? 'bg-purple-500/10 border-l-4 border-l-purple-500 border-b-purple-500/10' : 'hover:bg-neutral-800/30 border-l-4 border-l-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center transition-colors ${isSelected ? 'bg-purple-500 text-black' : 'bg-neutral-800 text-zinc-400'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-zinc-200 truncate">{u.username || u.email}</div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">{lastMsg?.content || 'Started a chat'}</div>
                </div>
              </button>
            )
          })}
          {sortedUsers.length === 0 && (
            <div className="p-8 text-xs text-zinc-500 text-center uppercase tracking-widest font-black opacity-50">
              No active conversations
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUserId ? (
        <div className="flex-1 flex flex-col bg-transparent/80">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeMessages.map(msg => {
              const isMe = msg.sender_id === adminId
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3 rounded-3xl max-w-[85%] text-sm ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-neutral-800 text-zinc-200 rounded-bl-sm border border-zinc-700 shadow-md'}`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold mt-1.5 uppercase tracking-widest px-2">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-5 border-t border-white/10 bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 flex gap-3">
            <input 
              value={content} onChange={e => setContent(e.target.value)} 
              placeholder="Type your reply to user..." 
              className="flex-1 px-5 py-4 bg-transparent border border-white/10 rounded-2xl text-sm outline-none focus:border-purple-500/50 text-zinc-200 placeholder-neutral-600 shadow-inner"
            />
            <button type="submit" disabled={loading || !content.trim()} className="px-8 py-4 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-black font-black tracking-widest uppercase text-xs rounded-2xl transition-all active:scale-[0.98] shrink-0 flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent/50 text-sm text-zinc-600 space-y-4">
          <MessageCircle className="w-16 h-16 opacity-10" />
          <p className="tracking-widest uppercase font-black text-xs opacity-50">Select an inbox to view chat history</p>
        </div>
      )}
    </div>
  )
}
