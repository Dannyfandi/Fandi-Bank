'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  loadingText?: string
  fallbackLoading?: boolean // For external loading states if not in a form
}

export function SubmitButton({ children, loadingText, fallbackLoading, className, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  
  const isLoading = pending || fallbackLoading

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative overflow-hidden transition-all duration-300 ${className} ${isLoading ? 'opacity-80 cursor-not-allowed scale-[0.98]' : ''}`}
    >
      <div className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm z-10 animate-in fade-in duration-300">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          {loadingText && <span className="font-bold tracking-widest uppercase text-xs sm:text-sm">{loadingText}</span>}
        </div>
      )}
    </button>
  )
}
