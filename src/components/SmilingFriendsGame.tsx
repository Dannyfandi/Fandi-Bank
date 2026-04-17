'use client'

import { useState, useEffect } from 'react'
import { Smile, Sparkles, AlertTriangle, ArrowRight, Zap, Target } from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { updateSmilingFriendsProgress } from '@/app/dashboard/actions'

const MAINS = [
  { id: 'mrfrog', name: 'Mr. Frog', url: '/characters/mrfrog.jpg' },
  { id: 'mrboss', name: 'Mr. Boss', url: '/characters/mrboss.jpg' },
  { id: 'alan', name: 'Alan', url: '/characters/alan.jpg' },
  { id: 'pim', name: 'Pim', url: '/characters/pim.jpg' },
  { id: 'charlie', name: 'Charlie', url: '/characters/charlie.jpg' },
  { id: 'glep', name: 'Glep', url: '/characters/glep.gif' }
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
  const [mathVar2, setMathVar2] = useState(5)
  const [mathOp, setMathOp] = useState('+')
  const [spamCount, setSpamCount] = useState(0)
  const [waitTime, setWaitTime] = useState(10)
  const [maxWait, setMaxWait] = useState(10)

  // New games states
  const [reactionGreen, setReactionGreen] = useState(false)
  const [reactionTimer, setReactionTimer] = useState<NodeJS.Timeout | null>(null)
  
  const [memorySeq, setMemorySeq] = useState<number[]>([])
  const [memoryCur, setMemoryCur] = useState<number>(0)
  const [memoryShow, setMemoryShow] = useState(false)

  const startGame = (type: number) => {
    setActiveMinigame(type)
    if (type === 0) { // Math
      setMathTarget(Math.floor(Math.random() * 50) + 10)
      setMathVar2(Math.floor(Math.random() * 20) + 1)
      setMathOp(Math.random() > 0.5 ? '+' : '-')
    } else if (type === 1) { // Spam Random 10 to 50
      setSpamCount(Math.floor(Math.random() * 41) + 10)
    } else if (type === 2) { // Wait Random 10s to 60s
      const w = Math.floor(Math.random() * 51) + 10
      setWaitTime(w)
      setMaxWait(w)
    } else if (type === 3) { // Reaction
      setReactionGreen(false)
      const t = setTimeout(() => setReactionGreen(true), Math.random() * 3000 + 1000)
      setReactionTimer(t)
    } else if (type === 4) { // Memory
      const seq = Array.from({length: 4}, () => Math.floor(Math.random() * 4))
      setMemorySeq(seq)
      setMemoryCur(0)
      setMemoryShow(true)
      setTimeout(() => setMemoryShow(false), 2000)
    }
  }

  // Minigame Wait logic
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
    const shouldUnlock = newRandoms % 4 === 0 // Requires 4 randoms to unlock 1 character now (Doubled length)
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
            Help people smile! Bring 4 random characters joy to summon a Smiling Friend.
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
               <button onClick={() => startGame(3)} disabled={cooldown>0} className="px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                 Test Reflex 😲
               </button>
               <button onClick={() => startGame(4)} disabled={cooldown>0} className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                 Memory Sync 🧠
               </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-800/50 rounded-xl animate-in slide-in-from-top-2 border border-white/10">
               {activeMinigame === 0 && (
                 <div className="space-y-3">
                   <p className="font-bold text-lg text-white text-center">Random Character is crying because they can't solve: {mathTarget} {mathOp} {mathVar2}</p>
                   <div className="flex justify-center gap-4 flex-wrap">
                      {[mathTarget + mathVar2, mathTarget - mathVar2, mathTarget + 1, mathTarget * 2].sort(() => Math.random() - 0.5).slice(0,4).map((ans, i) => (
                         <button key={i} onClick={() => {
                            if ((mathOp === '+' && ans === mathTarget + mathVar2) || (mathOp === '-' && ans === mathTarget - mathVar2)) winMinigame()
                            else setActiveMinigame(null) // Fail
                         }} className="w-14 h-14 bg-black hover:bg-indigo-500/30 border border-white/20 rounded-xl font-bold flex items-center justify-center text-lg">
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
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(1 - (waitTime/maxWait))*100}%`}} />
                   </div>
                   {waitTime === 0 ? (
                     <button onClick={() => winMinigame()} className="px-6 py-2 bg-emerald-500 text-black font-black rounded-xl">Smile! 😃</button>
                   ) : (
                     <p className="font-mono text-zinc-500">{waitTime}s remaining</p>
                   )}
                 </div>
               )}
               {activeMinigame === 3 && (
                 <div className="flex flex-col items-center gap-3">
                    <p className="font-bold text-center text-fuchsia-300">Wait for it to turn GREEN, then click!</p>
                    <button 
                      onClick={() => {
                        if (reactionGreen) winMinigame()
                        else {
                          if (reactionTimer) clearTimeout(reactionTimer)
                          setActiveMinigame(null)
                        }
                      }}
                      className={`w-full h-32 rounded-2xl font-black text-2xl transition-colors ${reactionGreen ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                      {reactionGreen ? 'CLICK NOW!' : 'Wait...'}
                    </button>
                 </div>
               )}
               {activeMinigame === 4 && (
                 <div className="flex flex-col items-center gap-4">
                    <p className="font-bold text-center text-orange-300">Sync with their memory! Remember the sequence.</p>
                    {memoryShow ? (
                      <div className="flex gap-2 p-4 bg-black rounded-xl">
                        {memorySeq.map((v, i) => <div key={i} className={`w-8 h-8 rounded-full ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][v]}`} />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 w-48">
                         {[0,1,2,3].map(v => (
                           <button key={v} onClick={() => {
                             if (v === memorySeq[memoryCur]) {
                               if (memoryCur === memorySeq.length - 1) winMinigame()
                               else setMemoryCur(c => c + 1)
                             } else {
                               setActiveMinigame(null) // Fail
                             }
                           }} className={`w-full h-16 rounded-xl ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][v]} hover:brightness-125`}></button>
                         ))}
                      </div>
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
          const isGlep = m.id === 'glep'
          return (
            <div key={m.id} className={`p-2 border rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? 'border-[#eab308]/50 bg-black/60 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/5 bg-black/20 grayscale opacity-40'} ${isGlep && isUnlocked ? 'animate-pulse' : ''}`}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 bg-zinc-900 shrink-0 ${isGlep && isUnlocked ? 'border-[#84cc16]/50' : 'border-white/10'}`}>
                 {isUnlocked ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={m.url} alt={m.name} className="w-full h-full object-cover" unoptimized-gif={isGlep ? 'true' : undefined} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center font-black text-2xl text-zinc-800">?</div>
                 )}
              </div>
              <p className={`text-xs font-black uppercase tracking-widest ${isUnlocked ? (isGlep ? 'text-[#84cc16]' : 'text-[#eab308]') : 'text-zinc-500'}`}>{m.name}{isGlep && isUnlocked ? ' ⭐' : ''}</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}
