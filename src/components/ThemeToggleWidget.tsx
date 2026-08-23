'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Palette,
  Sparkles,
  X,
  Check,
  Lock,
  Zap,
  Gamepad2,
  Monitor,
  Rocket,
  Shield,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { updateTheme } from '@/app/dashboard/actions'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface ThemeItem {
  id: string
  name: string
  subtitle: string
  description: string
  badge: string
  badgeColor: string
  icon: any
  gradient: string
  borderAccent: string
  glowColor: string
  unlocked: boolean
  unlockRequirement?: string
  isComingSoon?: boolean
}

export function ThemeToggleWidget({
  activeTheme = 'normal',
  hasSmilingFriends = false,
  hasStarWars = false,
}: {
  activeTheme?: string
  hasSmilingFriends?: boolean
  hasStarWars?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState(activeTheme)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasAnyUnlockedTheme = hasSmilingFriends || hasStarWars

  // Sync selectedThemeId with prop
  useEffect(() => {
    setSelectedThemeId(activeTheme || 'normal')
  }, [activeTheme])

  // Listen for open modals elsewhere to hide the floating bubble
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

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // If user has not unlocked any custom themes beyond normal, hide the bubble
  if (!hasAnyUnlockedTheme) return null

  const handleSelectTheme = async (themeId: string) => {
    if (themeId === selectedThemeId || isUpdating) return
    setIsUpdating(true)
    setSelectedThemeId(themeId)

    if (themeId === 'star_wars') {
      starWarsAudio.playLightsaberIgnite()
    } else {
      starWarsAudio.playKyberChime(880)
    }

    try {
      await updateTheme(themeId)
    } catch {
      // fallback
    } finally {
      setIsUpdating(false)
      setTimeout(() => {
        setIsOpen(false)
      }, 400)
    }
  }

  const THEMES: ThemeItem[] = [
    {
      id: 'normal',
      name: 'Luminous Glass',
      subtitle: 'Tema Original · Obsidiana & Violeta',
      description: 'Cristal frosted oscuro de alta legibilidad con reflejos violetas y fucsia.',
      badge: 'Estándar',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: Monitor,
      gradient: 'from-purple-950/60 via-zinc-950/80 to-purple-900/40',
      borderAccent: 'border-purple-500/40 hover:border-purple-400',
      glowColor: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      unlocked: true,
    },
    {
      id: 'star_wars',
      name: 'Star Wars: Galactic Edition',
      subtitle: 'Espacio Profundo · Estrella de la Muerte',
      description: 'Arte cinemático de la Estrella de la Muerte, neón Kyber Cyan y bordes Sith.',
      badge: 'Galáctico',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_#00E5FF]',
      icon: Zap,
      gradient: 'from-cyan-950/60 via-slate-950/90 to-red-950/40',
      borderAccent: 'border-cyan-500/50 hover:border-cyan-400',
      glowColor: 'shadow-[0_0_25px_rgba(0,229,255,0.3)]',
      unlocked: hasStarWars,
      unlockRequirement: 'Desbloquea los 6 hologramas en el mundo Star Wars',
    },
    {
      id: 'smiling_friends',
      name: 'Smiling Friends Labs',
      subtitle: 'Psicodélico · Mr. Frog & Pim',
      description: 'Mundo brillante amarillo y naranja con animaciones y estética de dibujos animados.',
      badge: 'Psicodélico',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_10px_#EAB308]',
      icon: Gamepad2,
      gradient: 'from-yellow-950/60 via-zinc-950/90 to-amber-950/40',
      borderAccent: 'border-yellow-500/50 hover:border-yellow-400',
      glowColor: 'shadow-[0_0_25px_rgba(234,179,8,0.3)]',
      unlocked: hasSmilingFriends,
      unlockRequirement: 'Desbloquea los 6 personajes en Smiling Friends Labs',
    },
    {
      id: 'cyberpunk_coming_soon',
      name: 'Matrix & Cyberpunk 2077',
      subtitle: 'Lluvia Digital · Verde Neón & Magenta',
      description: 'Próxima expansión temática con tipografía terminal y efectos de ciberespacio.',
      badge: 'Próximamente',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Sparkles,
      gradient: 'from-emerald-950/40 via-zinc-950/90 to-black',
      borderAccent: 'border-emerald-500/20',
      glowColor: '',
      unlocked: false,
      isComingSoon: true,
    },
  ]

  const visibilityClass = isModalOpen && !isOpen
    ? 'opacity-0 pointer-events-none scale-75'
    : 'opacity-100 scale-100'

  return (
    <>
      {/* 1. Floating Wall Peeking Trigger (Left Wall) */}
      <div
        className={`fixed bottom-24 sm:bottom-12 left-0 z-40 transition-all duration-300 ${visibilityClass}`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-end pr-2.5 sm:pr-3 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] border-2 border-white/50 cursor-pointer -translate-x-6 sm:-translate-x-5 hover:translate-x-0 transition-transform duration-300 touch-feedback"
          aria-label="Abrir Galería de Temas"
          title="Galería de Temas"
        >
          <Palette className="w-5 h-5 text-white animate-spin-slow group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-zinc-900 animate-pulse" />
        </button>
      </div>

      {/* 2. Centered Pop-up Modal with Travel / Expansion Animation */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-panel-heavy rounded-[32px] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] bg-zinc-950/95 animate-in zoom-in-90 duration-300 origin-bottom-left"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border border-white/30">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-purple-200 text-shadow-sm">
                    Galería de Temas
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Personaliza la apariencia y el universo visual de Fandi Bank
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-colors touch-feedback cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Spacious Theme Cards Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 custom-scrollbar flex-1">
              {THEMES.map((t) => {
                const isCurrentActive = selectedThemeId === t.id
                const IconComponent = t.icon

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (t.unlocked && !t.isComingSoon) {
                        handleSelectTheme(t.id)
                      }
                    }}
                    className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between gap-3 ${
                      t.unlocked && !t.isComingSoon
                        ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                        : 'opacity-65 cursor-not-allowed'
                    } ${
                      isCurrentActive
                        ? `${t.glowColor} ${t.borderAccent} bg-gradient-to-r ${t.gradient} ring-1 ring-white/30`
                        : `bg-gradient-to-r ${t.gradient} border-white/10 hover:border-white/25`
                    }`}
                  >
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-black/50 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-inner">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-zinc-100">
                              {t.name}
                            </h4>
                            <span
                              className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border ${t.badgeColor}`}
                            >
                              {t.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-medium">{t.subtitle}</p>
                        </div>
                      </div>

                      {/* Active / Lock Indicator */}
                      {isCurrentActive ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Activo
                        </span>
                      ) : !t.unlocked ? (
                        <span className="p-2 rounded-full bg-black/50 text-zinc-500 border border-white/10 shrink-0">
                          <Lock className="w-4 h-4" />
                        </span>
                      ) : null}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-300/90 leading-relaxed font-normal pl-0.5">
                      {t.description}
                    </p>

                    {/* Bottom Action Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      {!t.unlocked && !t.isComingSoon ? (
                        <span className="text-[11px] text-amber-300/80 font-bold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {t.unlockRequirement}
                        </span>
                      ) : t.isComingSoon ? (
                        <span className="text-[11px] text-zinc-400 italic">
                          En preparación para futuras actualizaciones...
                        </span>
                      ) : isCurrentActive ? (
                        <span className="text-[11px] text-emerald-400 font-bold">
                          ✓ Tema actualmente en uso
                        </span>
                      ) : (
                        <div className="flex items-center justify-end w-full">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectTheme(t.id)
                            }}
                            className="px-4 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-white/20 touch-feedback cursor-pointer"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
                            )}
                            <span>Aplicar Tema</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/50 border-t border-white/10 text-center">
              <p className="text-[11px] text-zinc-400">
                💡 Puedes cambiar de tema en cualquier momento tocando la burbuja flotante.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
