'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot } from 'lucide-react'
import { sendMessage } from '@/app/chat/actions'

export function ChatWidget({
  userId,
  adminId,
  initialMessages,
}: {
  userId: string
  adminId: string
  initialMessages: any[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSlidOut, setIsSlidOut] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when opening chat or receiving new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, initialMessages])

  // Listen for modal/bottom sheet opens on body to hide chat widget
  useEffect(() => {
    const checkModal = () => {
      const modalOpen =
        document.body.classList.contains('fandi-modal-open') ||
        document.body.classList.contains('modal-open')
      setIsModalOpen(modalOpen)
    }

    checkModal()

    const observer = new MutationObserver(() => {
      checkModal()
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // Auto-retract back into wall after 5 seconds of inactivity when not open
  const resetRetractTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsSlidOut(false)
    }, 5000)
  }

  useEffect(() => {
    if (isSlidOut && !isOpen) {
      resetRetractTimer()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isSlidOut, isOpen])

  const handleButtonClick = () => {
    if (!isSlidOut) {
      // First tap: slide out from wall
      setIsSlidOut(true)
      resetRetractTimer()
    } else {
      // Second tap: open full chat
      setIsOpen(true)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }

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

  // If a bottom sheet / popup is open, hide completely so it never overlaps
  const visibilityClass = isModalOpen
    ? 'opacity-0 pointer-events-none scale-75'
    : 'opacity-100 scale-100'

  return (
    <div
      className={`fixed bottom-24 sm:bottom-12 right-0 z-40 transition-all duration-300 ${visibilityClass}`}
    >
      {!isOpen ? (
        /* Peeking Wall Button */
        <button
          onClick={handleButtonClick}
          onMouseEnter={() => {
            setIsSlidOut(true)
            resetRetractTimer()
          }}
          className={`flex items-center gap-2 pl-3.5 pr-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-l-full shadow-2xl shadow-purple-900/60 border-l border-y border-purple-400/40 transition-all duration-300 touch-feedback select-none ${
            isSlidOut
              ? 'translate-x-0 pr-5'
              : 'translate-x-[52%] opacity-85 hover:opacity-100'
          }`}
          aria-label="Open Support Chat"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
          </div>
          {isSlidOut && (
            <span className="text-xs font-black tracking-wider uppercase whitespace-nowrap animate-in fade-in duration-200">
              Support
            </span>
          )}
        </button>
      ) : (
        /* Chat Window */
        <div className="mr-3 sm:mr-6 w-[calc(100vw-24px)] max-w-sm sm:max-w-md glass-panel-heavy rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-spring-scale border border-white/20">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/15 to-transparent border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/25 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-zinc-100 tracking-tight text-shadow-sm">
                  Fandi Bank Support
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                setIsSlidOut(true)
                resetRetractTimer()
              }}
              className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 h-80 sm:h-96 overflow-y-auto space-y-3 custom-scrollbar bg-black/40">
            {initialMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2.5 opacity-60">
                <MessageCircle className="w-10 h-10 text-purple-400" />
                <p className="text-xs text-zinc-300 px-4 font-medium">
                  Got a question about a debt, loan, or ticket? Send a message here!
                </p>
              </div>
            ) : (
              initialMessages.map((msg) => {
                const isMe = msg.sender_id === userId
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs sm:text-sm font-medium shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-br-none'
                          : 'bg-zinc-800/90 text-zinc-100 rounded-bl-none border border-white/10'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 mt-1 uppercase tracking-wider px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-white/10 bg-black/30 flex gap-2"
          >
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2.5 glass-input rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="p-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md touch-feedback shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
