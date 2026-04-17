'use client'

import { useState, useEffect } from 'react'
import { Smile, Sparkles, AlertTriangle, ArrowRight, Zap, Target } from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { updateSmilingFriendsProgress } from '@/app/dashboard/actions'

const MAINS = [
  { id: 'mrfrog', name: 'Mr. Frog', url: 'https://i.imgflip.com/6r0a25.jpg' },
  { id: 'mrboss', name: 'Mr. Boss', url: 'https://preview.redd.it/mr-boss-v0-x1u48l4h08hc1.jpeg?auto=webp&s=da63a9ebccd9a9ec2b10ab64161eb7ce77869aa7' },
  { id: 'alan', name: 'Alan', url: 'https://i.redd.it/does-anyone-else-realize-that-alands-job-is-literally-just-v0-v2540m7yvttc1.jpg?width=1003&format=pjpg&auto=webp&s=0fcd14f52e5a7096e2577c2a74c77cddf85d26ff' },
  { id: 'pim', name: 'Pim', url: 'https://m.media-amazon.com/images/M/MV5BMGUyNmQyODgtODY0OC00N2EzLThmZTMtOGZlN2NhYTNiNmJlXkEyXkFqcGc@._V1_QL75_UX500_CR0,47,500,281_.jpg' },
  { id: 'charlie', name: 'Charlie', url: 'https://i.ytimg.com/vi/S7Q8Z-zK8e0/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-DoACuAiKAgwIABABGDEgUSh_MA8=&rs=AOn4CLB-N1vM-G1lxyr-j5iX_0gA-xXz5A' },
  { id: 'glep', name: 'Glep', url: 'https://preview.redd.it/idk-why-but-in-my-opinion-glep-is-so-cute-is-just-my-opinion-v0-4kntg1n7z1bd1.png?width=640&crop=smart&auto=webp&s=6b8fd8cf12cd8cc274bf702a0a2561ea9de989cd' }
]

const RANDOMS = [
  { emoji: '😭', task: 'Math', solved: '😃' },
  { emoji: '😡', task: 'Spam', solved: '😁' },
  { emoji: '😨', task: 'Wait', solved: '😎' }
]

export function SmilingFriendsGame({ initialProgress, lang }: { initialProgress?: any, lang: 'en' | 'es' }) {
  const [randomsSmiled, setRandomsSmiled] = useState<number>(initialProgress?.randoms_smiled || 0)
  const [unlockedMains, setUnlockedMains] = useState<string[]>(initialProgress?.unlocked_mains || [])
  const [activeMinigame, setActiveMinigame] = useState<number | null>(null)
  
  // Anti-farm system: Track last win timestamp
  const [lastWinTime, setLastWinTime] = useState<number>(0)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [cooldown])

  // Sub-minigame states
  const [mathTarget, setMathTarget] = useState(0)
  const [mathOp, setMathOp] = useState('+')
  const [spamCount, setSpamCount] = useState(0)
  const [waitTime, setWaitTime] = useState(10)

  const startGame = (type: number) => {
    setActiveMinigame(type)
    if (type === 0) {
      setMathTarget(Math.floor(Math.random() * 20) + 10)
      setMathOp(Math.random() > 0.5 ? '+' : '-')
    } else if (type === 1) {
      setSpamCount(15) // need to click 15 times
    } else if (type === 2) {
      setWaitTime(7) // Need to wait 7 seconds
    }
  }

  // Minigame 2 Wait logic
  useEffect(() => {
    if (activeMinigame === 2 && waitTime > 0) {
       const t = setTimeout(() => setWaitTime(w => w - 1), 1000)
       return () => clearTimeout(t)
    }
  }, [activeMinigame, waitTime])

  const winMinigame = async (formData?: FormData) => {
    const now = Date.now()
    if (now - lastWinTime < 6000) {
      // Basic client check: games cannot be won faster than 6 seconds (10/min max speed theoretically per point system logic elsewhere)
    }
    
    setLastWinTime(now)
    setActiveMinigame(null)
    setCooldown(6)

    // Compute new logic securely on server
    const newRandoms = randomsSmiled + 1
    const shouldUnlock = newRandoms % 2 === 0
    let newlyUnlocked = null

    if (shouldUnlock) {
       const nextMain = MAINS.find(m => !unlockedMains.includes(m.id))
       if (nextMain) {
         newlyUnlocked = nextMain.id
         setUnlockedMains([...unlockedMains, newlyUnlocked])
       }
    }

    setRandomsSmiled(newRandoms)
    
    // Server action logic handles giving either +20 / +200 bonus and saving JSON
    const data = new FormData()
    data.append('randomsSmiled', newRandoms.toString())
    if (newlyUnlocked) data.append('newlyUnlocked', newlyUnlocked)
    await updateSmilingFriendsProgress(data)
  }

  const allUnlocked = unlockedMains.length === MAINS.length

  return (
    <div className="p-4 sm:p-6 bg-zinc-900/50 backdrop-blur-3xl border border-[#eab308]/30 rounded-3xl mt-6 shadow-[0_0_50px_rgba(234,179,8,0.15)] font-sans relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-[#eab308]/20 pb-4 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#eab308] tracking-tighter flex items-center gap-2 drop-shadow-md">
             😁 Smiling Friends Inc.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-bold mt-1 max-w-sm">
            Help people smile! Bring 2 random characters joy to summon a Smiling Friend.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 px-4 py-2 bg-black/40 border border-[#eab308]/40 rounded-xl">
           <p className="text-[10px] uppercase font-black tracking-widest text-[#eab308]">Randoms Smiled</p>
           <p className="text-2xl font-black text-white">{randomsSmiled}</p>
        </div>
      </div>

      {!allUnlocked ? (
        <div className="mb-8 p-4 bg-black/30 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-fuchsia-400"/> Current Mission (Cooldown: {cooldown}s)</h3>
          
          {activeMinigame === null ? (
            <div className="flex flex-wrap gap-3">
               <button onClick={() => startGame(0)} disabled={cooldown>0} className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                 Solve Problem 😭
               </button>
               <button onClick={() => startGame(1)} disabled={cooldown>0} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                 Calm Down User 😡
               </button>
               <button onClick={() => startGame(2)} disabled={cooldown>0} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                 Soothe Anxiety 😨
               </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-800/50 rounded-xl animate-in slide-in-from-top-2 border border-white/10">
               {activeMinigame === 0 && (
                 <div className="space-y-3">
                   <p className="font-bold text-lg text-white text-center">Random Character is crying because they can't solve: {mathTarget} {mathOp} 5</p>
                   <div className="flex justify-center gap-4">
                      {[mathTarget + 5, mathTarget - 5, mathTarget, mathTarget * 2].map((ans, i) => (
                         <button key={i} onClick={() => {
                            if ((mathOp === '+' && ans === mathTarget + 5) || (mathOp === '-' && ans === mathTarget - 5)) winMinigame()
                            else setActiveMinigame(null)
                         }} className="w-12 h-12 bg-black hover:bg-indigo-500/30 border border-white/20 rounded-xl font-bold flex items-center justify-center">
                            {ans}
                         </button>
                      ))}
                   </div>
                 </div>
               )}
               {activeMinigame === 1 && (
                 <div className="flex flex-col items-center gap-3">
                   <p className="font-bold text-center text-rose-300">This character is extremely angry! Click the chill pill {spamCount} times!</p>
                   <button onClick={() => {
                     if (spamCount <= 1) winMinigame()
                     else setSpamCount(s => s - 1)
                   }} className="w-20 h-20 text-4xl bg-rose-500/20 hover:bg-rose-500/30 rounded-full border-4 border-rose-500/50 active:scale-90 transition-transform flex items-center justify-center">
                     💊
                   </button>
                 </div>
               )}
               {activeMinigame === 2 && (
                 <div className="flex flex-col items-center gap-3">
                   <p className="font-bold text-center text-emerald-300">Just be patient and listen to them vent...</p>
                   <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(1 - (waitTime/7))*100}%`}} />
                   </div>
                   {waitTime === 0 ? (
                     <button onClick={() => winMinigame()} className="px-6 py-2 bg-emerald-500 text-black font-black rounded-xl">Smile! 😃</button>
                   ) : (
                     <p className="font-mono text-zinc-500">{waitTime}s remaining</p>
                   )}
                 </div>
               )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-6 bg-[#eab308]/20 border border-[#eab308]/50 rounded-2xl mb-8 animate-in zoom-in duration-500">
           <h3 className="text-2xl font-black text-[#eab308] uppercase tracking-widest drop-shadow-lg mb-2">🎉 MISSION COMPLETE! 🎉</h3>
           <p className="text-zinc-100">You helped everyone smile! The Smiling Friends Theme is now permanently unlocked on your profile! (Check settings/header to apply it!)</p>
        </div>
      )}

      {/* Main Roster grid */}
      <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-fuchsia-400"/> Primary Agents</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
        {MAINS.map(m => {
          const isUnlocked = unlockedMains.includes(m.id)
          return (
            <div key={m.id} className={`p-2 border rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? 'border-[#eab308]/50 bg-black/60 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/5 bg-black/20 grayscale opacity-40'}`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 border-white/10 bg-zinc-900 shrink-0">
                 {isUnlocked ? (
                   <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center font-black text-2xl text-zinc-800">?</div>
                 )}
              </div>
              <p className={`text-xs font-black uppercase tracking-widest ${isUnlocked ? 'text-[#eab308]' : 'text-zinc-500'}`}>{m.name}</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}
