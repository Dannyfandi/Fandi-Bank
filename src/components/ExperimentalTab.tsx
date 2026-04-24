'use client'

import { FlaskConical } from 'lucide-react'

const dict = {
  en: {
    expTitle: '🧪 Experimental HQ',
    desc: 'No active experiments right now. Check back later for new features!',
  },
  es: {
    expTitle: '🧪 Labs Experimental',
    desc: 'No hay experimentos activos. ¡Vuelve más tarde para probar nuevas funciones!',
  }
}

export function ExperimentalTab({ lang }: { lang: 'en' | 'es' }) {
  const t = dict[lang]

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.expTitle}
        </h2>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900/20 border border-white/5 text-center flex flex-col items-center justify-center text-zinc-500">
        <FlaskConical className="w-12 h-12 mb-4 text-emerald-500/20" />
        <p className="font-medium max-w-sm">{t.desc}</p>
      </div>
    </div>
  )
}
