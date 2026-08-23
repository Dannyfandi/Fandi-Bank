'use client'

import { useState, useRef, useEffect } from 'react'
import { Palette, Sparkles, X } from 'lucide-react'
import { ThemeSettings } from './ThemeSettings'

export function ThemeToggleWidget({
  activeTheme = 'normal',
  hasSmilingFriends = false,
  hasStarWars = false,
}: {
  activeTheme?: string
  hasSmilingFriends?: boolean
  hasStarWars?: boolean
}) {
  const [isSlidOut, setIsSlidOut] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const hasAnyUnlockedTheme = hasSmilingFriends || hasStarWars

  // Listen for active modal opens to hide widget
  useEffect(() => {
    const checkModal = () => {
      const modalOpen =
        document.body.classList.contains('fandi-modal-open') ||
        document.body.classList.contains('modal-open')
      setIsModalOpen(modalOpen)
    }

    checkModal()
    const observer = new MutationObserver(() => checkModal())
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Auto-retract back into left wall after 5s of inactivity
  const resetRetractTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsSlidOut(false)
    }, 5000)
  }

  useEffect(() => {
    if (isSlidOut) {
      resetRetractTimer()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isSlidOut])

  // Don't display if user has not unlocked any custom themes
  if (!hasAnyUnlockedTheme) return null

  const visibilityClass = isModalOpen
    ? 'opacity-0 pointer-events-none scale-75'
    : 'opacity-100 scale-100'

  return (
    <div
      className={`fixed bottom-24 sm:bottom-12 left-0 z-40 transition-all duration-300 ${visibilityClass}`}
    >
      <div
        className={`transition-transform duration-300 ease-out ${
          isSlidOut ? 'translate-x-3 sm:translate-x-5' : '-translate-x-7 sm:-translate-x-6'
        }`}
      >
        {!isSlidOut ? (
          /* Peeking Wall Circle Trigger */
          <button
            onClick={() => {
              setIsSlidOut(true)
              resetRetractTimer()
            }}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border-2 border-white/40 flex items-center justify-end pr-2.5 sm:pr-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            aria-label="Theme Selector"
            title="Temas Desbloqueados"
          >
            <Palette className="w-5 h-5 text-white animate-spin-slow" />
          </button>
        ) : (
          /* Slid-out Theme Dialog Launcher */
          <div className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-xl p-1.5 rounded-full border border-purple-500/40 shadow-2xl animate-spring-scale">
            <ThemeSettings
              activeTheme={activeTheme}
              hasSmilingFriends={hasSmilingFriends}
              hasStarWars={hasStarWars}
              trigger={
                <button
                  className="px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg touch-feedback cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  <span>Temas</span>
                </button>
              }
            />
            <button
              onClick={() => setIsSlidOut(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 touch-feedback"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
