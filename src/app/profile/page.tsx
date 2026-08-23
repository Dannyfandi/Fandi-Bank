import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { updateProfile } from './actions'
import { LanguageToggle } from '@/components/LanguageToggle'
import { User, Camera, AlignLeft, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'

const dict = {
  en: {
    back: 'Back to Dashboard',
    title: 'Edit Profile',
    subtitle: 'Customize how you appear to your friends in Fandi Bank.',
    avatarLabel: 'Upload Avatar Image',
    userLabel: 'Username',
    userPh: 'Ferb',
    descLabel: 'Bio / Description',
    descPh: 'Tell your friends about yourself...',
    saveBtn: 'Save Changes',
  },
  es: {
    back: 'Volver al Panel',
    title: 'Editar Perfil',
    subtitle: 'Personaliza cómo te ven tus amigos en Fandi Bank.',
    avatarLabel: 'Subir Foto de Perfil',
    userLabel: 'Nombre de Usuario',
    userPh: 'Ferb',
    descLabel: 'Biografía / Descripción',
    descPh: 'Cuéntale a tus amigos sobre ti...',
    saveBtn: 'Guardar Cambios',
  },
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'
  const t = dict[lang]

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const backLink = profile?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="min-h-screen bg-transparent text-zinc-50 p-3 sm:p-5 md:p-8 font-sans pb-16">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        <header className="flex items-center justify-between pb-4 border-b border-white/10 glass-panel px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-lg">
          <Link
            href={backLink}
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors font-bold text-xs sm:text-sm glass-panel hover:bg-white/10 px-3.5 py-2 rounded-full border border-white/10 touch-feedback"
          >
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <LanguageToggle />
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Avatar Preview */}
          <div className="md:col-span-1 flex flex-col items-center p-6 sm:p-8 glass-panel border border-white/10 shadow-2xl rounded-3xl relative overflow-hidden">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-purple-500/40 shadow-lg shadow-purple-900/40 relative mb-4 bg-black flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-zinc-500" />
              )}
            </div>
            <h2 className="text-lg font-black text-center text-zinc-100 text-shadow-sm">
              {profile?.username || 'No Name'}
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 mt-1.5 px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
              {profile?.role}
            </span>
            {profile?.description && (
              <p className="mt-4 text-center text-xs text-zinc-300 font-medium italic">
                &ldquo;{profile.description}&rdquo;
              </p>
            )}
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent text-shadow-sm">
                {t.title}
              </h1>
              <p className="text-xs font-medium text-zinc-400 mt-1">{t.subtitle}</p>
            </div>

            <div className="p-5 sm:p-7 glass-panel-heavy border border-white/15 rounded-3xl shadow-2xl relative overflow-hidden">
              <form action={updateProfile} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                    {t.avatarLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Camera className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      name="avatarFile"
                      type="file"
                      accept="image/*"
                      className="block w-full pl-10 pr-3 py-2 glass-input rounded-2xl text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-black file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                    {t.userLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      name="username"
                      type="text"
                      defaultValue={profile?.username || ''}
                      required
                      className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-white placeholder-zinc-500 text-sm"
                      placeholder={t.userPh}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                    {t.descLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 flex pointer-events-none">
                      <AlignLeft className="h-4 w-4 text-zinc-500" />
                    </div>
                    <textarea
                      name="description"
                      defaultValue={profile?.description || ''}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-white placeholder-zinc-500 text-sm resize-none"
                      placeholder={t.descPh}
                    />
                  </div>
                </div>

                <SubmitButton
                  className="w-full py-3.5 px-4 rounded-2xl text-xs font-black tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all touch-feedback shadow-lg shadow-purple-500/25"
                  loadingText="Saving..."
                >
                  {t.saveBtn}
                </SubmitButton>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
