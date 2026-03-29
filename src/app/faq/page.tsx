import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, User, CreditCard, Star, Calendar, MessageSquare, Briefcase } from 'lucide-react'
import { LanguageToggle } from '@/components/LanguageToggle'

const dict = {
  en: {
    back: 'Back to Dashboard',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about Fandi Bank.',
  },
  es: {
    back: 'Volver al Panel',
    title: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre Fandi Bank.',
  }
}

const faqs = [
  {
    icon: <User className="w-5 h-5 text-purple-400" />,
    en: {
      q: 'Can I change my profile picture?',
      a: 'Yes! Go to the "Profile" tab from your dashboard. Click on your avatar to upload a new image. You can also update your username and description there.'
    },
    es: {
      q: '¿Puedo cambiar mi foto de perfil?',
      a: '¡Sí! Ve a la pestaña "Perfil" desde tu panel. Haz clic en tu avatar para subir una nueva imagen. También puedes cambiar tu nombre de usuario y descripción.'
    }
  },
  {
    icon: <Star className="w-5 h-5 text-amber-400" />,
    en: {
      q: 'How is my Fandi Bank Score calculated?',
      a: 'Your Score goes up (+10 to +25) when you pay debts. However, unpaid debts slowly drain your score (-2 per unpaid debt, reducing further over time). A negative score results in account suspension.'
    },
    es: {
      q: '¿Cómo se calcula mi Puntaje Fandi Bank?',
      a: 'Tu Puntaje sube (+10 a +25) cuando pagas deudas. Sin embargo, las deudas no pagadas bajan tu puntaje de a poco (-2 por deuda, empeorando con el tiempo). Un puntaje negativo causa suspensión de cuenta.'
    }
  },
  {
    icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
    en: {
      q: 'What is a Concert Ticket Request?',
      a: 'Fandi Bank can buy pre-sale concert tickets for you. When you eventually pay Fandi Bank back, you pay the original pre-sale price PLUS 50% of the difference against the current public price.'
    },
    es: {
      q: '¿Qué es una Solicitud de Entrada?',
      a: 'Fandi Bank puede comprarte entradas en preventa. Cuando devuelvas el dinero a Fandi Bank, pagarás el precio de preventa MÁS el 50% de la diferencia con el precio al público actual.'
    }
  },
  {
    icon: <CreditCard className="w-5 h-5 text-rose-400" />,
    en: {
      q: 'Do loans have interest rates?',
      a: 'Yes. Approved Cash Loans accrue a minor 0.051% simple daily interest on the original loaned amount until fully paid off.'
    },
    es: {
      q: '¿Los préstamos tienen intereses?',
      a: 'Sí. Los Préstamos en Efectivo aprobados generan un interés simple diario del 0.051% sobre el monto prestado hasta ser pagados en su totalidad.'
    }
  },
  {
    icon: <Calendar className="w-5 h-5 text-fuchsia-400" />,
    en: {
      q: 'What happens if I cancel my RSVP to an Event late?',
      a: 'If you accept an event invitation but cancel your RSVP within 24 hours of the event start time, a $2,000 COP penalty will automatically be added to your debts.'
    },
    es: {
      q: '¿Qué pasa si cancelo mi RSVP a un evento muy tarde?',
      a: 'Si aceptas una invitación pero la cancelas faltando menos de 24 horas para el evento, se agregará una multa automática de $2,000 COP a tus deudas.'
    }
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
    en: {
      q: 'Can I suggest real app features or games?',
      a: 'Yes! Check out the "Labs Experimental" tab at the bottom of your dashboard. You can submit ideas which go directly to the Admin.'
    },
    es: {
      q: '¿Puedo sugerir funciones nuevas para la app?',
      a: '¡Sí! Revisa la pestaña "Labs Experimental" en tu panel. Ahí puedes enviar ideas que le llegarán directo al Administrador.'
    }
  }
]

export default async function FAQPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = dict[lang]

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const backLink = profile?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        
        <header className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10">
          <Link href={backLink} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <LanguageToggle />
        </header>

        <main className="space-y-6">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent inline-flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-emerald-400" /> {t.title}
            </h1>
            <p className="text-zinc-400 mt-2 font-medium">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 sm:p-6 bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 rounded-2xl shadow-xl hover:bg-zinc-900/50 transition-colors group">
                <h3 className="text-lg font-black text-white flex items-center gap-3 mb-2">
                   <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
                     {faq.icon}
                   </div>
                   {faq[lang].q}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium pl-14">
                   {faq[lang].a}
                </p>
              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  )
}
