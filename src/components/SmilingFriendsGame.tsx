'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Target } from 'lucide-react'
import { updateSmilingFriendsProgress } from '@/app/dashboard/actions'

const MAINS = [
  { id: 'mrfrog', name: 'Mr. Frog', url: '/characters/mrfrog.jpg' },
  { id: 'mrboss', name: 'Mr. Boss', url: '/characters/mrboss.jpg' },
  { id: 'alan', name: 'Alan', url: '/characters/alan.jpg' },
  { id: 'pim', name: 'Pim', url: '/characters/pim.jpg' },
  { id: 'charlie', name: 'Charlie', url: '/characters/charlie.jpg' },
  { id: 'glep', name: 'Glep', url: '/characters/glep.gif' },
]

export function SmilingFriendsGame({
  initialProgress,
  lang,
  addPoints,
}: {
  initialProgress?: any
  lang: 'en' | 'es'
  addPoints?: (p: number) => void
}) {
  const [prevProgress, setPrevProgress] = useState(initialProgress)
  const [randomsSmiled, setRandomsSmiled] = useState<number>(
    initialProgress?.randoms_smiled || 0
  )
  const [unlockedMains, setUnlockedMains] = useState<string[]>(
    initialProgress?.unlocked_mains || []
  )
  const [activeMinigame, setActiveMinigame] = useState<number | null>(null)

  // Sync state during render if initialProgress prop updates (e.g., when Admin resets game progress)
  if (prevProgress !== initialProgress) {
    setPrevProgress(initialProgress)
    setRandomsSmiled(initialProgress?.randoms_smiled || 0)
    setUnlockedMains(initialProgress?.unlocked_mains || [])
    setActiveMinigame(null)
  }

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
  const [mathAnswers, setMathAnswers] = useState<number[]>([])
  const [spamCount, setSpamCount] = useState(0)
  const [waitTime, setWaitTime] = useState(10)
  const [maxWait, setMaxWait] = useState(10)

  // Reflex and Memory states
  const [reactionGreen, setReactionGreen] = useState(false)
  const [reactionTimer, setReactionTimer] = useState<NodeJS.Timeout | null>(null)
  
  const [memorySeq, setMemorySeq] = useState<number[]>([])
  const [memoryCur, setMemoryCur] = useState<number>(0)
  const [memoryShow, setMemoryShow] = useState(false)

  const startGame = (type: number) => {
    setActiveMinigame(type)
    if (type === 0) { // Math
      const target = Math.floor(Math.random() * 50) + 10
      const var2 = Math.floor(Math.random() * 20) + 1
      const op = Math.random() > 0.5 ? '+' : '-'
      const correct = op === '+' ? target + var2 : target - var2
      const fake1 = correct + 2
      const fake2 = Math.max(1, correct - 3)
      const fake3 = correct + 5
      const options = [correct, fake1, fake2, fake3].sort(() => Math.random() - 0.5)

      setMathTarget(target)
      setMathVar2(var2)
      setMathOp(op)
      setMathAnswers(options)
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

  const winMinigame = async () => {
    const now = Date.now()
    if (now - lastWinTime < 6000) {
      // client anti-farm check
    }
    
    setLastWinTime(now)
    setActiveMinigame(null)
    setCooldown(6)

    const newRandoms = randomsSmiled + 1
    const shouldUnlock = newRandoms % 4 === 0
    let newlyUnlocked: string | null = null

    if (shouldUnlock) {
       const nextMain = MAINS.find(m => !unlockedMains.includes(m.id))
       if (nextMain) {
         newlyUnlocked = nextMain.id
         setUnlockedMains(prev => [...prev, newlyUnlocked as string])
       }
    }

    setRandomsSmiled(newRandoms)

    // Award Fandi Coins
    if (addPoints) addPoints(15)

    if (newlyUnlocked && addPoints) {
      addPoints(200)
      if ([...unlockedMains, newlyUnlocked].length >= MAINS.length) {
        addPoints(50)
      }
    }
    
    const data = new FormData()
    data.append('randomsSmiled', newRandoms.toString())
    if (newlyUnlocked) data.append('newlyUnlocked', newlyUnlocked)
    await updateSmilingFriendsProgress(data)
  }

  const allUnlocked = unlockedMains.length === MAINS.length

  return (
    <div className="p-5 sm:p-7 glass-panel-heavy border border-[#eab308]/30 rounded-[28px] mt-6 shadow-[0_0_50px_rgba(234,179,8,0.15)] font-sans relative overflow-hidden">
      {/* Decorative warm glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/10 blur-[90px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-[#eab308]/20 pb-4 relative z-10 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#eab308] tracking-tighter flex items-center gap-2 drop-shadow-md">
             😁 Smiling Friends Labs
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1 max-w-sm">
            {lang === 'es' 
              ? '¡Haz sonreír a la gente! Ayuda a 4 personajes aleatorios para invocar a un miembro de Smiling Friends.' 
              : 'Help people smile! Bring 4 random characters joy to summon a Smiling Friend.'}
          </p>
        </div>
        <div className="px-4 py-2 bg-black/50 border border-[#eab308]/40 rounded-2xl shrink-0">
           <p className="text-[10px] uppercase font-black tracking-widest text-[#eab308]">
             {lang === 'es' ? 'Sonrisas Logradas' : 'Randoms Smiled'}
           </p>
           <p className="text-2xl font-black text-white">{randomsSmiled}</p>
        </div>
      </div>

      {!allUnlocked ? (
        <div className="mb-8 p-4 sm:p-5 bg-black/40 rounded-2xl border border-white/10 relative z-10">
          <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-fuchsia-400"/>
            {lang === 'es' ? 'Misión Actual' : 'Current Mission'} {cooldown > 0 ? `(${cooldown}s)` : ''}
          </h3>
          
          {activeMinigame === null ? (
            <div className="flex flex-wrap gap-2.5">
               <button onClick={() => startGame(0)} disabled={cooldown > 0} className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all touch-feedback disabled:opacity-40">
                 {lang === 'es' ? 'Resolver Problema 😭' : 'Solve Problem 😭'}
               </button>
               <button onClick={() => startGame(1)} disabled={cooldown > 0} className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all touch-feedback disabled:opacity-40">
                 {lang === 'es' ? 'Calmar Usuario 😡' : 'Calm Down User 😡'}
               </button>
               <button onClick={() => startGame(2)} disabled={cooldown > 0} className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all touch-feedback disabled:opacity-40">
                 {lang === 'es' ? 'Calmar Ansiedad 😨' : 'Soothe Anxiety 😨'}
               </button>
               <button onClick={() => startGame(3)} disabled={cooldown > 0} className="px-3.5 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-xs font-bold transition-all touch-feedback disabled:opacity-40">
                 {lang === 'es' ? 'Reflejos Rápidos 😲' : 'Test Reflex 😲'}
               </button>
               <button onClick={() => startGame(4)} disabled={cooldown > 0} className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all touch-feedback disabled:opacity-40">
                 {lang === 'es' ? 'Sincronizar Memoria 🧠' : 'Memory Sync 🧠'}
               </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/15 animate-spring-scale">
               {activeMinigame === 0 && (
                 <div className="space-y-3">
                   <p className="font-bold text-base sm:text-lg text-white text-center">
                     {lang === 'es' ? 'El personaje no puede resolver:' : 'Random Character needs answer for:'}{' '}
                     <span className="text-[#eab308]">{mathTarget} {mathOp} {mathVar2}</span>
                   </p>
                   <div className="flex justify-center gap-3 flex-wrap">
                      {mathAnswers.map((ans, i) => (
                         <button
                           key={i}
                           onClick={() => {
                             const correct = mathOp === '+' ? mathTarget + mathVar2 : mathTarget - mathVar2
                             if (ans === correct) winMinigame()
                             else setActiveMinigame(null)
                           }}
                           className="w-14 h-14 bg-black/60 hover:bg-indigo-500/30 border border-white/20 rounded-xl font-black text-white flex items-center justify-center text-lg touch-feedback"
                         >
                            {ans}
                         </button>
                      ))}
                   </div>
                 </div>
               )}

               {activeMinigame === 1 && (
                 <div className="flex flex-col items-center gap-3">
                   <p className="font-bold text-center text-rose-300 text-sm">
                     {lang === 'es' ? `¡Haz clic en la píldora de calma ${spamCount} veces!` : `Click the chill pill ${spamCount} times!`}
                   </p>
                   <button
                     onClick={() => {
                       if (spamCount <= 1) winMinigame()
                       else setSpamCount(s => s - 1)
                     }}
                     className="w-20 h-20 text-4xl bg-rose-500/20 hover:bg-rose-500/30 rounded-full border-4 border-rose-500/50 touch-feedback flex items-center justify-center"
                   >
                     💊
                   </button>
                 </div>
               )}

               {activeMinigame === 2 && (
                 <div className="space-y-3 text-center">
                   <p className="font-bold text-emerald-300 text-sm">
                     {lang === 'es' ? `Mantén la calma y espera: ${waitTime}s` : `Be patient and breathe: ${waitTime}s`}
                   </p>
                   <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                     <div
                       className="h-full bg-emerald-500 transition-all duration-1000"
                       style={{ width: `${((maxWait - waitTime) / maxWait) * 100}%` }}
                     />
                   </div>
                   {waitTime === 0 && (
                     <button
                       onClick={winMinigame}
                       className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-sm touch-feedback"
                     >
                       {lang === 'es' ? '¡Listo, Reclamar!' : 'Complete!'}
                     </button>
                   )}
                 </div>
               )}

               {activeMinigame === 3 && (
                 <div className="flex flex-col items-center gap-3">
                   <p className="font-bold text-fuchsia-300 text-sm">
                     {reactionGreen
                       ? (lang === 'es' ? '¡¡DALE CLICK AHORA!!' : 'CLICK NOW!!')
                       : (lang === 'es' ? 'Espera a que se ponga VERDE...' : 'Wait for GREEN...')}
                   </p>
                   <button
                     onClick={() => {
                       if (reactionGreen) {
                         winMinigame()
                       } else {
                         if (reactionTimer) clearTimeout(reactionTimer)
                         setActiveMinigame(null)
                       }
                     }}
                     className={`w-32 h-32 rounded-3xl font-black text-lg transition-colors touch-feedback flex items-center justify-center ${
                       reactionGreen ? 'bg-emerald-500 text-black animate-pulse' : 'bg-red-950/80 text-red-400 border border-red-500/40'
                     }`}
                   >
                     {reactionGreen ? 'GO!' : 'WAIT'}
                   </button>
                 </div>
               )}

               {activeMinigame === 4 && (
                 <div className="space-y-4 text-center">
                   <p className="font-bold text-amber-300 text-sm">
                     {memoryShow
                       ? (lang === 'es' ? `Memoriza la secuencia: ${memorySeq.map(n => n + 1).join(' - ')}` : `Memorize sequence: ${memorySeq.map(n => n + 1).join(' - ')}`)
                       : (lang === 'es' ? `Presiona el siguiente número (#${memoryCur + 1})` : `Press step #${memoryCur + 1}`)}
                   </p>
                   {!memoryShow && (
                     <div className="flex justify-center gap-3">
                       {[0, 1, 2, 3].map(btnIdx => (
                         <button
                           key={btnIdx}
                           onClick={() => {
                             if (memorySeq[memoryCur] === btnIdx) {
                               if (memoryCur + 1 === memorySeq.length) {
                                 winMinigame()
                               } else {
                                 setMemoryCur(c => c + 1)
                               }
                             } else {
                               setActiveMinigame(null)
                             }
                           }}
                           className="w-14 h-14 bg-black/60 hover:bg-amber-500/30 border border-white/20 rounded-2xl font-black text-lg text-white touch-feedback"
                         >
                           {btnIdx + 1}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-[#eab308]/20 border border-[#eab308]/40 rounded-2xl flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#eab308] shrink-0" />
          <p className="text-xs sm:text-sm text-yellow-200 font-bold">
            {lang === 'es' 
              ? '¡Completaste todos los personajes de Smiling Friends! Tema desbloqueado en Ajustes.' 
              : 'All Smiling Friends characters unlocked! Smiling Friends theme is unlocked in Settings.'}
          </p>
        </div>
      )}

      {/* Main Characters Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 relative z-10">
        {MAINS.map(char => {
          const isUnlocked = unlockedMains.includes(char.id)
          return (
            <div
              key={char.id}
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                isUnlocked
                  ? 'bg-black/50 border-[#eab308]/40 shadow-lg shadow-yellow-500/10'
                  : 'bg-black/20 border-white/5 opacity-40 grayscale'
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/10 mb-2 bg-black flex items-center justify-center">
                {isUnlocked ? (
                  <img src={char.url} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🔒</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-center text-zinc-200 truncate w-full">
                {char.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
