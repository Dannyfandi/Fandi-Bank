'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function QuickPayButton() {
  const [copied, setCopied] = useState(false)
  const llavez = "dannyfandi.3@gmail.com"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(llavez)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleCopy}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-black font-black tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {copied ? "Llave copied! Go to your bank app to pay." : "Quick Pay (Copy Llave)"}
      </button>
      {copied && (
        <p className="text-purple-400 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
          {llavez} copied to clipboard!
        </p>
      )}
    </div>
  )
}
