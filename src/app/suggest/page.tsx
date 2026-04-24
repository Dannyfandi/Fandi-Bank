import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { SuggestForm } from '@/components/SuggestForm'

export default async function SuggestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value || 'en') as 'en' | 'es'

  const t = {
    en: {
      title: 'Suggestions HQ',
      back: 'Back to Dashboard',
      suggFeat: 'Suggest a Feature',
      suggFeatDesc: 'Have a cool idea for Fandi Bank? Tell us!',
      suggGame: 'Suggest a Game',
      suggGameDesc: 'Want a new mini-game? Recommend it.',
      placeholder: 'Describe your idea in detail...',
      submitSugg: 'Submit Suggestion',
    },
    es: {
      title: 'Buzón de Sugerencias',
      back: 'Volver al Inicio',
      suggFeat: 'Sugerir una Función',
      suggFeatDesc: '¿Tienes una idea genial para Fandi Bank? ¡Dínosla!',
      suggGame: 'Sugerir un Juego',
      suggGameDesc: '¿Quieres un nuevo mini-juego? Recomiéndalo.',
      placeholder: 'Describe tu idea en detalle...',
      submitSugg: 'Enviar Sugerencia',
    }
  }[lang]

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4 border-b border-white/10 pb-6">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SuggestForm t={t} type="feature" />
          <SuggestForm t={t} type="game" />
        </div>
      </div>
    </div>
  )
}
