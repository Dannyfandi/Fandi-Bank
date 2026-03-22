import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { updateProfile } from './actions'
import { LanguageToggle } from '@/components/LanguageToggle'
import { User, Camera, AlignLeft, ArrowLeft, Save } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const dict = {
  en: {
    back: 'Back to Dashboard',
    title: 'Edit Profile',
    subtitle: 'Customize how you appear to your friends in Fandi Bank.',
    avatarTitle: 'Avatar Profile Picture',
    avatarEmpty: 'No Avatar',
    avatarLabel: 'Upload Avatar Image',
    avatarPh: 'Choose a file...',
    userLabel: 'Username',
    userPh: 'Ferb',
    descLabel: 'Bio / Description',
    descPh: 'Tell your friends about yourself...',
    saveBtn: 'Save Changes'
  },
  es: {
    back: 'Volver al Panel',
    title: 'Editar Perfil',
    subtitle: 'Personaliza cómo te ven tus amigos en Fandi Bank.',
    avatarTitle: 'Foto de Perfil',
    avatarEmpty: 'Sin Foto',
    avatarLabel: 'Subir Foto de Perfil',
    avatarPh: 'Elegir archivo...',
    userLabel: 'Nombre de Usuario',
    userPh: 'Ferb',
    descLabel: 'Biografía / Descripción',
    descPh: 'Cuéntale a tus amigos sobre ti...',
    saveBtn: 'Guardar Cambios'
  }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
    <div className="min-h-screen bg-transparent text-zinc-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href={backLink} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <LanguageToggle />
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
           
           {/* Left Sidebar Avatar Preview */}
           <div className="md:col-span-1 flex flex-col items-center p-8 bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-2xl shadow-purple-900/20 rounded-[40px] relative overflow-hidden">
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.3)] relative mb-6 bg-black flex items-center justify-center">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-12 h-12 text-zinc-600" />
               )}
             </div>
             <h2 className="text-xl font-black text-center text-zinc-200">{profile?.username || 'No Name'}</h2>
             <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-500 mt-2">{profile?.role}</span>
             {profile?.description && (
               <p className="mt-4 text-center text-sm text-zinc-400 font-medium italic">"{profile.description}"</p>
             )}
           </div>

           {/* Right Column Form */}
           <div className="md:col-span-2 space-y-6">
             <div>
               <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-fuchsia-600 bg-clip-text text-transparent">
                 {t.title}
               </h1>
               <p className="text-sm font-medium text-zinc-400 mt-1">{t.subtitle}</p>
             </div>

             <div className="p-8 bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 rounded-[40px] shadow-2xl saturate-150 relative overflow-hidden">
               <form action={updateProfile} className="space-y-6 relative z-10">
                 
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">{t.avatarLabel}</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Camera className="h-5 w-5 text-zinc-500" />
                     </div>
                     <input
                       name="avatarFile" type="file" accept="image/*"
                       className="block w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-black file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 focus:outline-none transition-all shadow-inner"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">{t.userLabel}</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <User className="h-5 w-5 text-zinc-500" />
                     </div>
                     <input
                       name="username" type="text" defaultValue={profile?.username || ''} required
                       className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all shadow-inner"
                       placeholder={t.userPh}
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">{t.descLabel}</label>
                   <div className="relative">
                     <div className="absolute top-3 left-4 flex pointer-events-none">
                       <AlignLeft className="h-5 w-5 text-zinc-500" />
                     </div>
                     <textarea
                       name="description" defaultValue={profile?.description || ''} rows={4}
                       className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all shadow-inner resize-none"
                       placeholder={t.descPh}
                     />
                   </div>
                 </div>

                 <button
                   type="submit"
                   className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-sm font-black tracking-widest uppercase text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-black transition-all active:scale-[0.98] mt-4 shadow-lg shadow-purple-500/25"
                 >
                   {t.saveBtn}
                 </button>

               </form>
             </div>
           </div>

        </main>

      </div>
    </div>
  )
}
