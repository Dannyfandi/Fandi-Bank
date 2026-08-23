import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { SuggestForm } from '@/components/SuggestForm'

export default async function SuggestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'es') as 'en' | 'es'

  const t = {
    en: {
      title: 'Suggestions HQ',
      back: 'Back',
      suggFeat: 'Suggest a Feature',
      suggFeatDesc: 'Have a cool idea for Fandi Bank? Tell us!',
      suggGame: 'Suggest a Game',
      suggGameDesc: 'Want a new mini-game? Recommend it.',
      suggBug: 'Report a Bug',
      suggBugDesc: 'Found something broken or weird? Let us know.',
      suggProduct: 'Suggest a Product',
      suggProductDesc: 'What should we add to the Rewards Shop?',
      placeholder: 'Describe your idea in detail...',
      submitSugg: 'Submit Suggestion',
    },
    es: {
      title: 'Buzón de Sugerencias',
      back: 'Volver',
      suggFeat: 'Sugerir una Función',
      suggFeatDesc: '¿Tienes una idea genial para Fandi Bank? ¡Dínosla!',
      suggGame: 'Sugerir un Juego',
      suggGameDesc: '¿Quieres un nuevo mini-juego? Recomiéndalo.',
      suggBug: 'Reportar un Bug',
      suggBugDesc: '¿Encontraste un error o algo raro? Avísanos.',
      suggProduct: 'Sugerir un Producto',
      suggProductDesc: '¿Qué deberíamos añadir a la Tienda de Premios?',
      placeholder: 'Describe tu idea en detalle...',
      submitSugg: 'Enviar Sugerencia',
    },
  }[lang]

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 p-3 sm:p-5 md:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center gap-3 border-b border-white/10 glass-panel px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-lg">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors font-bold text-xs sm:text-sm glass-panel hover:bg-white/10 px-3.5 py-2 rounded-full border border-white/10 touch-feedback"
          >
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2 text-shadow-sm">
            <Lightbulb className="w-5 h-5 text-blue-400" /> {t.title}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <SuggestForm t={t} type="feature" />
          <SuggestForm t={t} type="game" />
          <SuggestForm t={t} type="product" />
          <SuggestForm t={t} type="bug" />
        </div>
      </div>
    </div>
  )
}
