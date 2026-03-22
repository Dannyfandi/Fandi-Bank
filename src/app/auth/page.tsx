'use client'
import { login, signup } from './actions'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, Mail, Lock, CheckCircle2, User } from 'lucide-react'
import Image from 'next/image'

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (isLogin) {
      await login(formData)
    } else {
      await signup(formData)
    }
    setTimeout(() => setLoading(false), 2000)
  }

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        window.history.replaceState(null, '', '/auth')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, message])

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Liquid Pulse Swirling Background Aesthetics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute w-[800px] h-[800px] bg-purple-600/40 rounded-full blur-[120px] mix-blend-screen animate-pulse opacity-60" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-600/40 rounded-full blur-[100px] mix-blend-screen animate-spin opacity-70" style={{ animationDuration: '24s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-violet-600/40 rounded-full blur-[140px] mix-blend-screen animate-pulse opacity-50" style={{ animationDuration: '8s' }} />
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        {error && (
          <div className="w-full p-4 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 fade-in">
             <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex shrink-0 items-center justify-center">
               <Shield className="w-4 h-4" />
             </div>
             <p className="text-sm font-bold text-red-100">{error}</p>
          </div>
        )}
        {message && (
          <div className="w-full p-4 bg-purple-950/80 border border-purple-500/50 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
             <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex shrink-0 items-center justify-center">
               <CheckCircle2 className="w-4 h-4" />
             </div>
             <p className="text-sm font-bold text-purple-100">{message}</p>
          </div>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <div className="w-[500px] h-[280px] sm:w-[560px] sm:h-[320px] relative mb-6 hover:scale-105 transition-transform duration-700 ease-out -ml-4">
           {/* Logo Integration */}
           <Image src="/logo.png" alt="Fandi Bank Logo" fill className="object-contain drop-shadow-[0_0_60px_rgba(168,85,247,1)]" priority />
        </div>
        <h2 className="text-center text-3xl font-black tracking-tighter bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
          {isLogin ? 'Welcome Back' : 'Join Fandi Bank'}
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-zinc-400">
          {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start tracking expenses with your friends.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10">
        <div className="bg-zinc-900/30 backdrop-blur-[40px] shadow-2xl shadow-purple-900/20 saturate-150/80 backdrop-blur-xl py-8 px-4 sm:px-10 border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <div className="space-y-1 relative animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    name="username" type="text" required={!isLogin}
                    className="block w-full pl-11 pr-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all shadow-inner"
                    placeholder="Ferb"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  name="email" type="email" required
                  className="block w-full pl-11 pr-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all shadow-inner"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  name="password" type="password" required
                  className="block w-full pl-11 pr-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black transition-all active:scale-[0.98] mt-2 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-zinc-400 hover:text-purple-400 transition-colors focus:outline-none"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
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
