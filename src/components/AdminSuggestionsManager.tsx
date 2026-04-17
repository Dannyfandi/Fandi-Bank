'use client'

import { Lightbulb, User, Gamepad2, ArrowRight } from 'lucide-react'

export function AdminSuggestionsManager({ suggestions }: { suggestions: any[] }) {
  const games = suggestions.filter(s => s.type === 'game')
  const features = suggestions.filter(s => s.type === 'feature')

  return (
    <div className="p-6 sm:p-8 bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 rounded-[24px] sm:rounded-3xl shadow-xl mt-8">
      <h2 className="text-xl sm:text-2xl font-black text-rose-400 mb-6 flex items-center gap-3">
        <Lightbulb className="w-6 h-6" /> User Suggestions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Features Submissions */}
        <div className="space-y-4">
          <h3 className="font-bold text-amber-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Feature Ideas ({features.length})
          </h3>
          <div className="space-y-3">
            {features.length === 0 && <p className="text-zinc-500 text-sm">No feature ideas yet.</p>}
            {features.map(s => (
              <div key={s.id} className="p-4 bg-black/40 border border-amber-500/10 rounded-2xl relative group">
                <p className="text-xs text-zinc-500 font-bold flex items-center gap-1.5 mb-2">
                  <User className="w-3 h-3 text-amber-500" /> {s.profiles?.username || 'Unknown'}
                  <span className="text-[10px] ml-auto font-medium">{new Date(s.created_at).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-zinc-300 font-medium leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Games Submissions */}
        <div className="space-y-4">
          <h3 className="font-bold text-fuchsia-400 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Game Requests ({games.length})
          </h3>
          <div className="space-y-3">
            {games.length === 0 && <p className="text-zinc-500 text-sm">No game ideas yet.</p>}
            {games.map(s => (
              <div key={s.id} className="p-4 bg-black/40 border border-fuchsia-500/10 rounded-2xl relative group">
                <p className="text-xs text-zinc-500 font-bold flex items-center gap-1.5 mb-2">
                  <User className="w-3 h-3 text-fuchsia-500" /> {s.profiles?.username || 'Unknown'}
                  <span className="text-[10px] ml-auto font-medium">{new Date(s.created_at).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-zinc-300 font-medium leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
