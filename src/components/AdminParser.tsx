'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { applyBulkDebtsAndPayments } from '@/app/admin/actions'
import { formatCOP } from '@/utils/currency'

type Profile = { id: string, username: string, email: string }

export function AdminParser({ users }: { users: Profile[] }) {
  const [text, setText] = useState('')
  const [parsedData, setParsedData] = useState<{name: string, entries: any[]}>({ name: '', entries: [] })
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugMsg, setDebugMsg] = useState('')

  const handleParse = () => {
    if (!text) return
    setDebugMsg('')
    
    let nameStr = ''
    let contentStr = text

    if (text.includes(':')) {
      const parts = text.split(':')
      nameStr = parts[0].trim()
      contentStr = parts.slice(1).join(':').trim() // Join rest in case of multiple colons
    }

    let normalized = contentStr.trim()
    if (!normalized.startsWith('+') && !normalized.startsWith('-')) {
      normalized = '+ ' + normalized
    }

    // Matches + 200k Item or - 750k, case insensitive for k/K
    const regex = /([+-])\s*(\d+)[kK]\s*([^+\-\n]*)/g
    const results = []
    let match

    while ((match = regex.exec(normalized)) !== null) {
      const sign = match[1]
      const amountCOP = parseInt(match[2], 10) * 1000
      let desc = match[3].trim()

      if (sign === '+') {
        results.push({ type: 'debt', amount: amountCOP, description: desc || 'Varios' })
      } else if (sign === '-') {
        results.push({ type: 'payment', amount: amountCOP, description: desc || 'Pago (Manual)' })
      }
    }

    if (results.length === 0) {
      setDebugMsg('Could not find any amounts formatted like "20k" or "- 50k". Check your string format!')
      return
    }

    setParsedData({ name: nameStr, entries: results })

    // Auto select user if match
    if (nameStr) {
      const matchedUser = users.find(u => u.username?.toLowerCase() === nameStr.toLowerCase())
      if (matchedUser) setSelectedUserId(matchedUser.id)
    }
  }

  const handleSubmit = async () => {
    if (!selectedUserId || parsedData.entries.length === 0) return
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append('userId', selectedUserId)
    formData.append('entries', JSON.stringify(parsedData.entries))
    
    await applyBulkDebtsAndPayments(formData)
    
    setIsSubmitting(false)
    setParsedData({ name: '', entries: [] })
    setText('')
    setDebugMsg('Successfully committed to Database! 🎉')
  }

  return (
    <div className="p-6 border border-purple-500/30 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4 relative z-10">
        <Sparkles className="w-5 h-5 text-purple-400" />
        AI Debt & Payment Parser
      </h2>
      <p className="text-sm text-zinc-400 mb-6 relative z-10">
        Paste your raw notes string (e.g. <code>Ferb: 200k Weed + 12k - 750k</code>). Ensure the numbers have a "k"!
      </p>

      <div className="space-y-4 relative z-10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste string here..."
          className="w-full h-32 px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
        />
        
        <button 
          onClick={handleParse}
          className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-purple-400 font-bold rounded-xl transition-all"
        >
          Parse Magic String
        </button>

        {debugMsg && <p className={`text-sm tracking-wide ${debugMsg.includes('Success') ? 'text-purple-400' : 'text-amber-400'}`}>{debugMsg}</p>}

        {parsedData.entries.length > 0 && (
          <div className="mt-6 space-y-4 p-4 bg-transparent rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-purple-400">
                {parsedData.name ? `Previewing: ${parsedData.name}` : 'Previewing Elements'}
              </h3>
              <select 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-3 py-1 bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 border border-white/10 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Map to User...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username || u.email}</option>
                ))}
              </select>
            </div>

            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {parsedData.entries.map((entry, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150 shadow-sm">
                  <span className="text-zinc-300 truncate mr-4">
                    {entry.type === 'payment' ? '💰 Payment' : '💸 ' + entry.description}
                  </span>
                  <span className={`font-bold tracking-tight ${entry.type === 'payment' ? 'text-purple-400' : 'text-red-400'}`}>
                    {entry.type === 'payment' ? '-' : '+'}{formatCOP(entry.amount)}
                  </span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedUserId}
              className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-black font-black tracking-widest uppercase text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Committing...' : 'Commit to Database'} <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
