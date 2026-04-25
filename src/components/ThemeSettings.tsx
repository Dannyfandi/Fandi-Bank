'use client'

import { useState } from 'react'
import { Palette, Check, Monitor, Gamepad2, X } from 'lucide-react'
import { updateTheme } from '@/app/dashboard/actions'

export function ThemeSettings({ 
  activeTheme, 
  hasSmilingFriends,
  trigger
}: { 
  activeTheme: string, 
  hasSmilingFriends: boolean,
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleThemeChange = async (theme: string) => {
    setIsUpdating(true)
    await updateTheme(theme)
    setIsUpdating(false)
    setOpen(false)
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer flex-1">
          {trigger}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white" title="Themes">
          <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                <h3 className="font-bold text-white flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance Settings</h3>
                <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-6 space-y-4">
                 <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Select Theme</p>
                 
                 <button disabled={isUpdating} onClick={() => handleThemeChange('normal')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${activeTheme === 'normal' || !activeTheme ? 'bg-purple-900/30 border-purple-500/50' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                    <div className="flex items-center gap-3">
                       <Monitor className={`w-5 h-5 ${activeTheme === 'normal' || !activeTheme ? 'text-purple-400' : 'text-zinc-500'}`} />
                       <div className="text-left">
                          <p className={`font-bold ${activeTheme === 'normal' || !activeTheme ? 'text-purple-300' : 'text-zinc-300'}`}>Fandi Normal</p>
                          <p className="text-xs text-zinc-500">Default dark elegant theme</p>
                       </div>
                    </div>
                    {(activeTheme === 'normal' || !activeTheme) && <Check className="w-5 h-5 text-purple-400" />}
                 </button>

                 <button disabled={!hasSmilingFriends || isUpdating} onClick={() => handleThemeChange('smiling_friends')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${activeTheme === 'smiling_friends' ? 'bg-[#eab308]/20 border-[#eab308]/50' : !hasSmilingFriends ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed' : 'bg-black/40 border-white/5 hover:border-[#eab308]/30'}`}>
                    <div className="flex items-center gap-3">
                       <Gamepad2 className={`w-5 h-5 ${activeTheme === 'smiling_friends' ? 'text-[#eab308]' : 'text-zinc-500'}`} />
                       <div className="text-left">
                          <p className={`font-bold ${activeTheme === 'smiling_friends' ? 'text-[#eab308]' : 'text-zinc-300'}`}>Smiling Friends</p>
                          <p className="text-xs text-zinc-500">{hasSmilingFriends ? 'Unlocked Reward!' : 'Locked. Defeat the minigame.'}</p>
                       </div>
                    </div>
                    {activeTheme === 'smiling_friends' && <Check className="w-5 h-5 text-[#eab308]" />}
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  )
}
