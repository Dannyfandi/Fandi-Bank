'use client'

import { useState } from 'react'
import { Lightbulb, Gamepad2 } from 'lucide-react'
import { submitSuggestion } from '@/app/dashboard/actions'
import { SubmitButton } from '@/components/SubmitButton'

export function SuggestForm({ t, type }: { t: any, type: 'feature' | 'game' }) {
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
  const title = isFeature ? t.suggFeat : t.suggGame
  const desc = isFeature ? t.suggFeatDesc : t.suggGameDesc

  return (
    <div className={`p-6 sm:p-8 border bg-zinc-900/40 backdrop-blur-[40px] rounded-3xl space-y-6 ${isFeature ? 'border-blue-500/30' : 'border-purple-500/30'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl border ${isFeature ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
          {isFeature ? <Lightbulb className="w-8 h-8 text-blue-400" /> : <Gamepad2 className="w-8 h-8 text-purple-400" />}
        </div>
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className={`text-sm ${isFeature ? 'text-blue-200/60' : 'text-purple-200/60'}`}>{desc}</p>
        </div>
      </div>
      <form id={`form-${type}`} action={handleSuggestion} className="space-y-4">
        <input type="hidden" name="type" value={type} />
        <textarea name="description" rows={4} required placeholder={t.placeholder} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:outline-none resize-none" style={{ borderColor: isFeature ? '#3b82f6' : '#a855f7' }} />
        <SubmitButton className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${isFeature ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 shadow-blue-500/10' : 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 shadow-purple-500/10'}`}>
          {t.submitSugg}
        </SubmitButton>
        {msg && <p className={`text-sm font-bold text-center mt-2 ${isFeature ? 'text-blue-400' : 'text-purple-400'}`}>{msg}</p>}
      </form>
    </div>
  )
}
