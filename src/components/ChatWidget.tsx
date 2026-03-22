'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { sendMessage } from '@/app/chat/actions'

export function ChatWidget({ userId, adminId, initialMessages }: { userId: string, adminId: string, initialMessages: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, initialMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    const fd = new FormData()
    fd.append('content', content)
    fd.append('receiverId', adminId)
    await sendMessage(fd)
    setContent('')
    setLoading(false)
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 bg-purple-500 hover:bg-purple-400 text-black rounded-full shadow-[0_0_40px_-5px_var(--tw-shadow-color)] shadow-purple-500/50 transition-transform hover:scale-110 z-50">
        <MessageCircle className="w-7 h-7" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-purple-400 tracking-tight">Fandi Bank Support</h3>
            <p className="text-[9px] uppercase tracking-widest text-purple-500/60 mt-0.5">Replies may take 24-48 hours</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-purple-500/20 rounded-full text-purple-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 h-96 overflow-y-auto space-y-4 bg-transparent/50">
        {initialMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <MessageCircle className="w-12 h-12 text-zinc-600" />
            <p className="text-xs text-zinc-400 px-4">Got a question about your debt or a ticket request? Send Fandi a message here.</p>
          </div>
        ) : (
          initialMessages.map(msg => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-purple-500 text-black font-medium rounded-tr-sm' : 'bg-neutral-800 text-zinc-200 rounded-tl-sm border border-zinc-700'}`}>
                  {msg.content}
                </div>
                <span className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-wider">
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 flex gap-2">
        <input 
          value={content} onChange={e => setContent(e.target.value)} 
          placeholder="Ask a question..." 
          className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-sm outline-none focus:border-purple-500/50 text-zinc-200 placeholder-neutral-600"
        />
        <button type="submit" disabled={loading || !content.trim()} className="p-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-black rounded-2xl transition-colors shrink-0">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
