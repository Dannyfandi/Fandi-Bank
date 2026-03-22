'use client'

import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const switchLanguage = (lang: string) => {
    // Standard google translate cookie logic
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`
    document.cookie = `googtrans=/en/${lang}; path=/`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/10">
      <Languages className="w-4 h-4 text-zinc-500" />
      <button onClick={() => switchLanguage('en')} className="text-xs font-bold text-zinc-400 hover:text-purple-400 transition-colors">EN</button>
      <span className="text-zinc-700 text-xs">|</span>
      <button onClick={() => switchLanguage('es')} className="text-xs font-bold text-zinc-400 hover:text-purple-400 transition-colors">ES</button>
      <div id="google_translate_element" className="hidden"></div>
    </div>
  )
}
