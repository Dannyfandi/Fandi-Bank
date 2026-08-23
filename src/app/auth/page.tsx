'use client'

import { login, signup } from './actions'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, Mail, Lock, CheckCircle2, User } from 'lucide-react'
import Image from 'next/image'

const dict = {
  en: {
    welcome: 'Welcome Back',
    join: 'Join Fandi Bank',
    descLogin: 'Enter your details to access your dashboard.',
    descJoin: 'Sign up to start tracking expenses with your friends.',
    username: 'Username',
    email: 'Email Address',
    password: 'Password',
    btnIn: 'Sign In',
    btnUp: 'Create Account',
    switchIn: 'Already have an account? Sign in',
    switchUp: "Don't have an account? Sign up",
    processing: 'Processing...',
    created: 'Account created! You can now sign in.',
  },
  es: {
    welcome: 'Bienvenido de nuevo',
    join: 'Únete a Fandi Bank',
    descLogin: 'Ingresa tus datos para acceder a tu panel.',
    descJoin: 'Regístrate para empezar a registrar gastos con tus amigos.',
    username: 'Usuario',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    btnIn: 'Iniciar Sesión',
    btnUp: 'Crear Cuenta',
    switchIn: '¿Ya tienes una cuenta? Iniciar sesión',
    switchUp: '¿No tienes una cuenta? Regístrate',
    processing: 'Procesando...',
    created: '¡Cuenta creada! Ya puedes iniciar sesión.',
  },
}

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'en' | 'es'>('es')

  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const created = searchParams.get('created')

  useEffect(() => {
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/)
    if (match) setLang(match[2] as 'en' | 'es')
  }, [])

  const t = dict[lang] || dict.es

  useEffect(() => {
    if (created === '1') {
      setIsLogin(true)
      setLoading(false)
    }
  }, [created])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      if (isLogin) {
        await login(formData)
      } else {
        await signup(formData)
      }
    } catch {
      // Server action redirects
    }
    setTimeout(() => setLoading(false), 4000)
  }

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        window.history.replaceState(null, '', '/auth')
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [error, message])

  const displayMessage = created === '1' ? t.created : message

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Toast Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        {error && (
          <div className="w-full p-4 bg-red-950/90 border border-red-500/50 rounded-2xl flex items-center gap-3 shadow-2xl shadow-red-500/30 animate-in slide-in-from-top-4 fade-in backdrop-blur-xl">
            <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex shrink-0 items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-red-100">{error}</p>
          </div>
        )}
        {displayMessage && (
          <div className="w-full p-4 bg-purple-950/90 border border-purple-500/50 rounded-2xl flex items-center gap-3 shadow-2xl shadow-purple-500/30 animate-in slide-in-from-top-4 fade-in duration-300 backdrop-blur-xl">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 flex shrink-0 items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-purple-100">{displayMessage}</p>
          </div>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <div className="w-[300px] h-[180px] sm:w-[420px] sm:h-[240px] relative mb-4 hover:scale-105 transition-transform duration-700 ease-out">
          <Image
            src="/logo.png"
            alt="Fandi Bank Logo"
            fill
            className="object-contain drop-shadow-[0_0_50px_rgba(168,85,247,0.7)]"
            priority
          />
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-br from-white to-zinc-300 bg-clip-text text-transparent text-shadow-md">
          {isLogin ? t.welcome : t.join}
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm font-medium text-zinc-400">
          {isLogin ? t.descLogin : t.descJoin}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10">
        <div className="glass-panel-heavy shadow-2xl py-7 px-5 sm:px-8 border border-white/15 rounded-[32px]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1 relative animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                  {t.username}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-white placeholder-zinc-500 text-sm"
                    placeholder="Ferb"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                {t.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-white placeholder-zinc-500 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-white placeholder-zinc-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-2xl text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all active:scale-[0.98] mt-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 touch-feedback"
            >
              {loading ? t.processing : isLogin ? t.btnIn : t.btnUp}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold text-zinc-400 hover:text-purple-300 transition-colors touch-feedback"
            >
              {isLogin ? t.switchUp : t.switchIn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <AuthContent />
    </Suspense>
  )
}
