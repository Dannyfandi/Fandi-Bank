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
      document.body.classList.add('fandi-modal-open')
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('fandi-modal-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('fandi-modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        className={`relative w-full ${maxWidth} glass-panel-heavy rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl z-10 max-h-[88vh] flex flex-col animate-spring-up sm:animate-spring-scale border-t sm:border border-white/20`}
      >
        {/* Grab Handle for Mobile */}
        <div className="sm:hidden pt-3.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/25">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-purple-400">{icon}</div>}
            <h3 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight text-shadow-sm">
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

        {/* Content Body with Extra Bottom Spacing for Comfort */}
        <div className="p-6 sm:p-7 pb-12 sm:pb-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
