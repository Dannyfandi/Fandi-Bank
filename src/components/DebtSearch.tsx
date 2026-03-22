'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

type SortField = 'date' | 'amount' | 'alpha'
type SortDir = 'asc' | 'desc'

interface DebtSearchProps {
  debts: any[]
  onFilter: (filtered: any[]) => void
  lang: 'en' | 'es'
}

const dict = {
  en: {
    searchPh: 'Search transactions...',
    sortDate: 'Date',
    sortAmount: 'Amount',
    sortAlpha: 'A-Z',
    results: 'results'
  },
  es: {
    searchPh: 'Buscar transacciones...',
    sortDate: 'Fecha',
    sortAmount: 'Monto',
    sortAlpha: 'A-Z',
    results: 'resultados'
  }
}

export function DebtSearch({ debts, onFilter, lang }: DebtSearchProps) {
  const [query, setQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const t = dict[lang]

  const applyFilter = (q: string, sf: SortField, sd: SortDir) => {
    let filtered = [...debts]

    // Text search
    if (q.trim()) {
      const lower = q.toLowerCase()
      filtered = filtered.filter(d =>
        d.description?.toLowerCase().includes(lower) ||
        new Date(d.created_at).toLocaleDateString().includes(lower)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0
      if (sf === 'date') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sf === 'amount') {
        cmp = Number(a.amount) - Number(b.amount)
      } else {
        cmp = (a.description || '').localeCompare(b.description || '')
      }
      return sd === 'asc' ? cmp : -cmp
    })

    onFilter(filtered)
  }

  const handleQuery = (val: string) => {
    setQuery(val)
    applyFilter(val, sortField, sortDir)
  }

  const handleSort = (field: SortField) => {
    const newDir = sortField === field && sortDir === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDir(newDir)
    applyFilter(query, field, newDir)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={e => handleQuery(e.target.value)}
          placeholder={t.searchPh}
          className="w-full pl-11 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
        {(['date', 'amount', 'alpha'] as SortField[]).map(f => (
          <button
            key={f}
            onClick={() => handleSort(f)}
            className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${
              sortField === f
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-transparent text-zinc-500 border-white/10 hover:text-zinc-300'
            }`}
          >
            {f === 'date' ? t.sortDate : f === 'amount' ? t.sortAmount : t.sortAlpha}
            {sortField === f && <ArrowUpDown className="w-2.5 h-2.5" />}
          </button>
        ))}
      </div>
    </div>
  )
}
