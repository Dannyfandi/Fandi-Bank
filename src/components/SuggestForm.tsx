'use client'

import { useState } from 'react'
import { Lightbulb, Gamepad2, Bug, ShoppingBag } from 'lucide-react'
import { submitSuggestion } from '@/app/dashboard/actions'
import { SubmitButton } from '@/components/SubmitButton'

export function SuggestForm({ t, type }: { t: any, type: 'feature' | 'game' | 'bug' | 'product' }) {
  const [msg, setMsg] = useState('')

  const handleSuggestion = async (formData: FormData) => {
    const res = await submitSuggestion(formData)
    if (res?.success) setMsg(res.success)
    if (res?.error) setMsg(res.error)
    setTimeout(() => {
      setMsg('')
      // Clear form
      const form = document.getElementById(`form-${type}`) as HTMLFormElement
      if (form) form.reset()
    }, 2000)
  }

  const isFeature = type === 'feature'
  const isGame = type === 'game'
  const isBug = type === 'bug'
  const isProduct = type === 'product'

  const title = isFeature ? t.suggFeat : isGame ? t.suggGame : isBug ? t.suggBug : t.suggProduct
  const desc = isFeature ? t.suggFeatDesc : isGame ? t.suggGameDesc : isBug ? t.suggBugDesc : t.suggProductDesc

  let colorClass = ''
  let textClass = ''
  let borderClass = ''
  let icon = null
  let shadowClass = ''
  let hexColor = ''

  if (isFeature) {
    colorClass = 'bg-blue-500/10 border-blue-500/20'
    textClass = 'text-blue-200/60'
    borderClass = 'border-blue-500/30'
    icon = <Lightbulb className="w-8 h-8 text-blue-400" />
    shadowClass = 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-400 shadow-blue-500/10'
    hexColor = '#3b82f6'
  } else if (isGame) {
    colorClass = 'bg-purple-500/10 border-purple-500/20'
    textClass = 'text-purple-200/60'
    borderClass = 'border-purple-500/30'
    icon = <Gamepad2 className="w-8 h-8 text-purple-400" />
    shadowClass = 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-400 shadow-purple-500/10'
    hexColor = '#a855f7'
  } else if (isBug) {
    colorClass = 'bg-red-500/10 border-red-500/20'
    textClass = 'text-red-200/60'
    borderClass = 'border-red-500/30'
    icon = <Bug className="w-8 h-8 text-red-400" />
    shadowClass = 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400 shadow-red-500/10'
    hexColor = '#ef4444'
  } else if (isProduct) {
    colorClass = 'bg-teal-500/10 border-teal-500/20'
    textClass = 'text-teal-200/60'
    borderClass = 'border-teal-500/30'
    icon = <ShoppingBag className="w-8 h-8 text-teal-400" />
    shadowClass = 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/30 text-teal-400 shadow-teal-500/10'
    hexColor = '#14b8a6'
  }

  return (
    <div className={`p-6 sm:p-8 border bg-zinc-900/40 backdrop-blur-[40px] rounded-3xl space-y-6 ${borderClass}`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl border ${colorClass}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className={`text-sm ${textClass}`}>{desc}</p>
        </div>
      </div>
      <form id={`form-${type}`} action={handleSuggestion} className="space-y-4">
        <input type="hidden" name="type" value={type} />
        <textarea name="description" rows={4} required placeholder={t.placeholder} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:outline-none resize-none" style={{ borderColor: hexColor }} />
        <SubmitButton className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg border ${shadowClass}`}>
          {t.submitSugg}
        </SubmitButton>
        {msg && <p className={`text-sm font-bold text-center mt-2 ${hexColor === '#ef4444' ? 'text-red-400' : hexColor === '#14b8a6' ? 'text-teal-400' : isFeature ? 'text-blue-400' : 'text-purple-400'}`}>{msg}</p>}
      </form>
    </div>
  )
}
