'use client'

import { Lightbulb, User, Gamepad2, ChevronDown } from 'lucide-react'

export function AdminSuggestionsManager({ suggestions }: { suggestions: any[] }) {
  const games = suggestions.filter((s) => s.type === 'game')
  const features = suggestions.filter((s) => s.type === 'feature')

  return (
    <details className="p-4 sm:p-6 glass-panel border border-white/10 rounded-[28px] shadow-xl space-y-4">
      <summary className="cursor-pointer list-none flex items-center justify-between select-none">
        <h2 className="text-base sm:text-lg font-black text-blue-400 flex items-center gap-2.5 text-shadow-sm">
          <Lightbulb className="w-5 h-5" /> Sugerencias de la Comunidad (
          {suggestions.length})
        </h2>
        <ChevronDown className="w-5 h-5 text-zinc-400" />
      </summary>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-3">
        {/* Features Submissions */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Ideas de Funciones ({features.length})
          </h3>
          <div className="space-y-2.5">
            {features.length === 0 && (
              <p className="text-zinc-500 text-xs py-2">No hay sugerencias aún.</p>
            )}
            {features.map((s) => (
              <div
                key={s.id}
                className="p-3.5 bg-black/40 border border-amber-500/20 rounded-2xl relative group"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-amber-400" />{' '}
                    {s.profiles?.username || 'Usuario'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Games Submissions */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-fuchsia-400 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Solicitudes de Juegos ({games.length})
          </h3>
          <div className="space-y-2.5">
            {games.length === 0 && (
              <p className="text-zinc-500 text-xs py-2">No hay ideas de juegos aún.</p>
            )}
            {games.map((s) => (
              <div
                key={s.id}
                className="p-3.5 bg-black/40 border border-fuchsia-500/20 rounded-2xl relative group"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-fuchsia-400" />{' '}
                    {s.profiles?.username || 'Usuario'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  )
}
