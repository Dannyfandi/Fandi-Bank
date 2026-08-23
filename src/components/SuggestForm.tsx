'use client'

import { useState } from 'react'
import { Lightbulb, Gamepad2, Bug, ShoppingBag, CheckCircle, Sparkles } from 'lucide-react'
import { submitSuggestion } from '@/app/dashboard/actions'
import { SubmitButton } from '@/components/SubmitButton'

export function SuggestForm({
  t,
  type: initialType = 'feature',
}: {
  t?: any
  type?: 'feature' | 'game' | 'bug' | 'product'
}) {
  const [selectedType, setSelectedType] = useState<'feature' | 'game' | 'bug' | 'product'>(
    initialType
  )
  const [msg, setMsg] = useState('')

  const dict = t || {
    suggFeat: 'Sugerir Funcionalidad',
    suggFeatDesc: '¿Tienes una idea para mejorar Fandi Bank?',
    suggGame: 'Sugerir Minijuego',
    suggGameDesc: '¿Qué juego te gustaría ver en la app?',
    suggBug: 'Reportar Error / Bug',
    suggBugDesc: '¿Encontraste algo roto o que no funciona bien?',
    suggProduct: 'Sugerir Producto para la Tienda',
    suggProductDesc: '¿Qué premio o producto te gustaría canjear?',
    placeholder: 'Escribe tu idea o sugerencia en detalle...',
    submitSugg: 'Enviar Sugerencia',
  }

  const handleSuggestion = async (formData: FormData) => {
    formData.set('type', selectedType)
    const res = await submitSuggestion(formData)
    if (res?.success) setMsg(res.success)
    if (res?.error) setMsg(res.error)
    setTimeout(() => {
      setMsg('')
      const form = document.getElementById(`form-${selectedType}`) as HTMLFormElement
      if (form) form.reset()
    }, 2500)
  }

  const isFeature = selectedType === 'feature'
  const isGame = selectedType === 'game'
  const isBug = selectedType === 'bug'
  const isProduct = selectedType === 'product'

  const title = isFeature
    ? dict.suggFeat
    : isGame
    ? dict.suggGame
    : isBug
    ? dict.suggBug
    : dict.suggProduct
  const desc = isFeature
    ? dict.suggFeatDesc
    : isGame
    ? dict.suggGameDesc
    : isBug
    ? dict.suggBugDesc
    : dict.suggProductDesc

  let colorClass = 'bg-blue-500/10 border-blue-500/20'
  let textClass = 'text-blue-200/70'
  let borderClass = 'border-blue-500/30'
  let icon = <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
  let shadowClass =
    'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-300 shadow-blue-500/10'

  if (isGame) {
    colorClass = 'bg-purple-500/10 border-purple-500/20'
    textClass = 'text-purple-200/70'
    borderClass = 'border-purple-500/30'
    icon = <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
    shadowClass =
      'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-300 shadow-purple-500/10'
  } else if (isBug) {
    colorClass = 'bg-red-500/10 border-red-500/20'
    textClass = 'text-red-200/70'
    borderClass = 'border-red-500/30'
    icon = <Bug className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
    shadowClass =
      'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300 shadow-red-500/10'
  } else if (isProduct) {
    colorClass = 'bg-teal-500/10 border-teal-500/20'
    textClass = 'text-teal-200/70'
    borderClass = 'border-teal-500/30'
    icon = <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
    shadowClass =
      'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/30 text-teal-300 shadow-teal-500/10'
  }

  return (
    <div className="space-y-4">
      {/* Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setSelectedType('feature')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-feedback ${
            isFeature
              ? 'bg-blue-500/25 border-blue-400 text-blue-200'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Idea</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('game')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-feedback ${
            isGame
              ? 'bg-purple-500/25 border-purple-400 text-purple-200'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Juego</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('product')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-feedback ${
            isProduct
              ? 'bg-teal-500/25 border-teal-400 text-teal-200'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Tienda</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('bug')}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-feedback ${
            isBug
              ? 'bg-red-500/25 border-red-400 text-red-200'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Reporte</span>
        </button>
      </div>

      <div
        className={`p-5 sm:p-6 border bg-zinc-950/60 backdrop-blur-xl rounded-2xl space-y-4 ${borderClass}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${colorClass}`}>{icon}</div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
            <p className={`text-xs ${textClass}`}>{desc}</p>
          </div>
        </div>

        <form id={`form-${selectedType}`} action={handleSuggestion} className="space-y-4">
          <input type="hidden" name="type" value={selectedType} />
          <textarea
            name="description"
            rows={4}
            required
            placeholder={dict.placeholder}
            className="w-full glass-input rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 resize-none"
          />
          <SubmitButton
            className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-lg border touch-feedback ${shadowClass}`}
          >
            {dict.submitSugg}
          </SubmitButton>
          {msg && (
            <p className="text-xs font-bold text-center mt-2 text-emerald-400 bg-emerald-950/50 p-2 rounded-xl border border-emerald-500/30 animate-spring-scale">
              {msg}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
