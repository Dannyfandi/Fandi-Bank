'use client'

import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  children: ReactNode
  maxWidth?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'max-w-lg',
}: BottomSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        className={`relative w-full ${maxWidth} glass-panel-heavy rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col animate-spring-up sm:animate-spring-scale border-t sm:border border-white/20`}
      >
        {/* Grab Handle for Mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-purple-400">{icon}</div>}
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight text-shadow-sm">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors touch-feedback"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
