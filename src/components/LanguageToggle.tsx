'use client'

import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const switchLanguage = (lang: string) => {
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-900/30 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
      <Languages className="w-4 h-4 text-purple-400" />
      <button onClick={() => switchLanguage('en')} className="text-xs font-black tracking-widest text-zinc-300 hover:text-white transition-colors">EN</button>
      <span className="text-zinc-700 text-xs">|</span>
      <button onClick={() => switchLanguage('es')} className="text-xs font-black tracking-widest text-zinc-300 hover:text-white transition-colors">ES</button>
    </div>
  )
}
