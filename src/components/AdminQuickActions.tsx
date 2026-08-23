'use client'

import { useState } from 'react'
import {
  Briefcase,
  Wallet,
  Award,
  Sparkles,
  PlusCircle,
  TrendingDown,
  ArrowRight,
  Check,
} from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { SubmitButton } from './SubmitButton'
import {
  createDebt,
  createPayment,
  updateManualScore,
  applyBulkDebtsAndPayments,
} from '@/app/admin/actions'
import { formatCOP } from '@/utils/currency'

interface Profile {
  id: string
  username: string
  email: string
  score?: number
}

export function AdminQuickActions({
  users,
  t,
}: {
  users: Profile[]
  t: any
}) {
  const [activeSheet, setActiveSheet] = useState<
    'debt' | 'payment' | 'score' | 'parser' | null
  >(null)

  // AI Parser state
  const [parserText, setParserText] = useState('')
  const [parsedData, setParsedData] = useState<{ name: string; entries: any[] }>({
    name: '',
    entries: [],
  })
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugMsg, setDebugMsg] = useState('')

  const handleParse = () => {
    if (!parserText) return
    setDebugMsg('')

    let nameStr = ''
    let contentStr = parserText

    if (parserText.includes(':')) {
      const parts = parserText.split(':')
      nameStr = parts[0].trim()
      contentStr = parts.slice(1).join(':').trim()
    }

    let normalized = contentStr.trim()
    if (!normalized.startsWith('+') && !normalized.startsWith('-')) {
      normalized = '+ ' + normalized
    }

    const regex = /([+-])\s*(\d+)[kK]\s*([^+\-\n]*)/g
    const results = []
    let match

    while ((match = regex.exec(normalized)) !== null) {
      const sign = match[1]
      const amountCOP = parseInt(match[2], 10) * 1000
      const desc = match[3].trim()

      if (sign === '+') {
        results.push({ type: 'debt', amount: amountCOP, description: desc || 'Varios' })
      } else if (sign === '-') {
        results.push({
          type: 'payment',
          amount: amountCOP,
          description: desc || 'Pago (Manual)',
        })
      }
    }

    if (results.length === 0) {
      setDebugMsg(
        'Could not find any amounts formatted like "20k" or "- 50k". Check your string format!'
      )
      return
    }

    setParsedData({ name: nameStr, entries: results })

    if (nameStr) {
      const found = users.find(
        (u) =>
          u.username?.toLowerCase().includes(nameStr.toLowerCase()) ||
          u.email?.toLowerCase().includes(nameStr.toLowerCase())
      )
      if (found) setSelectedUserId(found.id)
    }
  }

  const handleApplyBulk = async () => {
    if (!selectedUserId || parsedData.entries.length === 0) return
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('userId', selectedUserId)
    formData.append('entries', JSON.stringify(parsedData.entries))

    await applyBulkDebtsAndPayments(formData)
    setIsSubmitting(false)
    setParserText('')
    setParsedData({ name: '', entries: [] })
    setActiveSheet(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-black text-zinc-200 tracking-wider uppercase flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-purple-400" />
          Acciones de Administrador
        </h2>
      </div>

      {/* 4 Mobile-First Quick Action Trigger Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Add Debt */}
        <button
          onClick={() => setActiveSheet('debt')}
          className="p-3.5 rounded-2xl glass-panel border border-red-500/30 hover:border-red-500/60 bg-red-950/20 text-left transition-all touch-feedback shadow-lg flex flex-col justify-between group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-100">{t.addDebt}</h4>
            <p className="text-[10px] text-red-300/70 font-medium">Registrar deuda</p>
          </div>
        </button>

        {/* 2. Log Payment */}
        <button
          onClick={() => setActiveSheet('payment')}
          className="p-3.5 rounded-2xl glass-panel border border-purple-500/30 hover:border-purple-500/60 bg-purple-950/20 text-left transition-all touch-feedback shadow-lg flex flex-col justify-between group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-100">{t.addPayment}</h4>
            <p className="text-[10px] text-purple-300/70 font-medium">Registrar abono</p>
          </div>
        </button>

        {/* 3. Modify Score */}
        <button
          onClick={() => setActiveSheet('score')}
          className="p-3.5 rounded-2xl glass-panel border border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20 text-left transition-all touch-feedback shadow-lg flex flex-col justify-between group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-100">Puntaje Fandi</h4>
            <p className="text-[10px] text-amber-300/70 font-medium">Sumar/restar pts</p>
          </div>
        </button>

        {/* 4. AI Parser */}
        <button
          onClick={() => setActiveSheet('parser')}
          className="p-3.5 rounded-2xl glass-panel border border-fuchsia-500/30 hover:border-fuchsia-500/60 bg-fuchsia-950/20 text-left transition-all touch-feedback shadow-lg flex flex-col justify-between group"
        >
          <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-100">AI Text Parser</h4>
            <p className="text-[10px] text-fuchsia-300/70 font-medium">Copia y pega rápido</p>
          </div>
        </button>
      </div>

      {/* 1. Modal: Add Manual Debt */}
      <BottomSheet
        isOpen={activeSheet === 'debt'}
        onClose={() => setActiveSheet(null)}
        title={t.addDebt}
        icon={<Briefcase className="w-5 h-5 text-red-400" />}
      >
        <form
          action={async (formData) => {
            await createDebt(formData)
            setActiveSheet(null)
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.selectUser}
            </label>
            <select
              name="userId"
              required
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 bg-zinc-900"
            >
              <option value="" className="bg-zinc-900 text-zinc-400">
                {t.selectUser}
              </option>
              {users.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.username || p.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.desc}
            </label>
            <input
              name="description"
              type="text"
              required
              placeholder={t.desc}
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.amount}
            </label>
            <input
              name="amount"
              type="number"
              required
              placeholder={t.amount}
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <SubmitButton
            loadingText="Adding..."
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl text-xs transition-all tracking-wider uppercase touch-feedback shadow-lg shadow-red-600/25"
          >
            {t.addBtn}
          </SubmitButton>
        </form>
      </BottomSheet>

      {/* 2. Modal: Add Manual Payment */}
      <BottomSheet
        isOpen={activeSheet === 'payment'}
        onClose={() => setActiveSheet(null)}
        title={t.addPayment}
        icon={<Wallet className="w-5 h-5 text-purple-400" />}
      >
        <form
          action={async (formData) => {
            await createPayment(formData)
            setActiveSheet(null)
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.selectUser}
            </label>
            <select
              name="userId"
              required
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 bg-zinc-900"
            >
              <option value="" className="bg-zinc-900 text-zinc-400">
                {t.selectUser}
              </option>
              {users.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.username || p.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.descOpt}
            </label>
            <input
              name="description"
              type="text"
              placeholder={t.descOpt}
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.amount}
            </label>
            <input
              name="amount"
              type="number"
              required
              placeholder={t.amount}
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <SubmitButton
            loadingText="Adding..."
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black rounded-2xl text-xs transition-all tracking-wider uppercase touch-feedback shadow-lg shadow-purple-600/25"
          >
            {t.logPayment}
          </SubmitButton>
        </form>
      </BottomSheet>

      {/* 3. Modal: Modify Score */}
      <BottomSheet
        isOpen={activeSheet === 'score'}
        onClose={() => setActiveSheet(null)}
        title="Modificar Puntaje Fandi"
        icon={<Award className="w-5 h-5 text-amber-400" />}
      >
        <form
          action={async (formData) => {
            await updateManualScore(formData)
            setActiveSheet(null)
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              {t.selectUser}
            </label>
            <select
              name="userId"
              required
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 bg-zinc-900"
            >
              <option value="" className="bg-zinc-900 text-zinc-400">
                {t.selectUser}
              </option>
              {users.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.username || p.email} ({p.score ?? 0} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              Cantidad de Puntos
            </label>
            <input
              name="amount"
              type="number"
              required
              placeholder="Ej. 10 o -5"
              className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <SubmitButton
            loadingText="Aplicando..."
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black rounded-2xl text-xs transition-all tracking-wider uppercase touch-feedback shadow-lg shadow-amber-600/25"
          >
            Aplicar Puntos
          </SubmitButton>
        </form>
      </BottomSheet>

      {/* 4. Modal: AI Text Parser */}
      <BottomSheet
        isOpen={activeSheet === 'parser'}
        onClose={() => setActiveSheet(null)}
        title="AI Quick Text Parser"
        icon={<Sparkles className="w-5 h-5 text-fuchsia-400" />}
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Pega una cadena como{' '}
            <code className="text-fuchsia-300 bg-white/10 px-1.5 py-0.5 rounded">
              Ferb: + 20k Didi + 50k Cine - 30k Transferencia
            </code>
          </p>

          <textarea
            value={parserText}
            onChange={(e) => setParserText(e.target.value)}
            rows={3}
            placeholder="Pega aquí los valores en formato 'k'..."
            className="w-full px-4 py-3 glass-input rounded-2xl text-xs text-zinc-100 placeholder-zinc-500 resize-none"
          />

          <button
            onClick={handleParse}
            type="button"
            className="w-full py-3 bg-fuchsia-600/25 hover:bg-fuchsia-600/35 border border-fuchsia-500/40 text-fuchsia-300 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all touch-feedback flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Parsear Cadena
          </button>

          {debugMsg && <p className="text-xs text-red-400 font-medium">{debugMsg}</p>}

          {parsedData.entries.length > 0 && (
            <div className="p-4 rounded-2xl bg-black/50 border border-fuchsia-500/30 space-y-3 animate-spring-scale">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-300">
                  Usuario Detectado:
                </span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-3 py-1.5 glass-input rounded-xl text-xs bg-zinc-900 text-white"
                >
                  <option value="">Selecciona usuario...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-zinc-900 text-white">
                      {u.username || u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {parsedData.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs p-2 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        entry.type === 'debt' ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {entry.type === 'debt' ? '+' : '-'} {formatCOP(entry.amount)}
                    </span>
                    <span className="text-zinc-300 truncate max-w-[160px]">
                      {entry.description}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyBulk}
                disabled={!selectedUserId || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all disabled:opacity-50 touch-feedback flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                {isSubmitting ? 'Aplicando...' : 'Aplicar Todos los Movimientos'}
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
