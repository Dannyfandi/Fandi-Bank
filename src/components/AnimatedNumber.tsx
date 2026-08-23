'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatAsCurrency?: boolean
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedNumber({
  value,
  duration = 800,
  formatAsCurrency = false,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(0)
  const prevValueRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = prevValueRef.current
    const targetValue = value
    const startTime = performance.now()

    if (startValue === targetValue) {
      setDisplayValue(targetValue)
      return
    }

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Spring-like easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4)
      const current = Math.round(startValue + (targetValue - startValue) * ease)

      setDisplayValue(current)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateValue)
      } else {
        setDisplayValue(targetValue)
        prevValueRef.current = targetValue
      }
    }

    animFrameRef.current = requestAnimationFrame(updateValue)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [value, duration])

  const formatNumber = (num: number) => {
    if (formatAsCurrency) {
      return `$ ${new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 0,
      }).format(num)}`
    }
    return num.toLocaleString()
  }

  return (
    <span className={`inline-block tabular-nums transition-all ${className}`}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}
