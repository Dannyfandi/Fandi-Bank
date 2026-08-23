'use client'

import { useState } from 'react'
import {
  PlusCircle,
  Wallet,
  Wand2,
  CalendarPlus,
  Sparkles,
  Users,
  MapPin,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { AdminParser } from './AdminParser'
import { SubmitButton } from './SubmitButton'
import { createDebt, createPayment, createEvent } from '@/app/admin/actions'

export function AdminBottomNav({ users = [], t }: { users: any[]; t: any }) {
  const [activeSheet, setActiveSheet] = useState<
    'none' | 'addDebt' | 'logPayment' | 'parser' | 'createEvent'
  >('none')

  // Create Event Form State
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }

  return (
    <>
      {/* Mobile Fixed Admin Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/85 backdrop-blur-2xl border-t border-white/15 px-3 py-2 pb-5 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Add Debt */}
          <button
            onClick={() => setActiveSheet('addDebt')}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-zinc-400 hover:text-purple-300 touch-feedback transition-colors"
          >
            <PlusCircle className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-bold tracking-tight">Add Debt</span>
          </button>

          {/* 2. Log Payment */}
          <button
            onClick={() => setActiveSheet('logPayment')}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-zinc-400 hover:text-emerald-300 touch-feedback transition-colors"
          >
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold tracking-tight">Payment</span>
          </button>

          {/* 3. Center: AI Text Parser Button */}
          <button
            onClick={() => setActiveSheet('parser')}
            className="flex flex-col items-center justify-center -mt-5 p-3 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/40 border-2 border-white/30 touch-feedback animate-pulse"
            aria-label="AI Text Parser"
            title="AI Text Parser"
          >
            <Wand2 className="w-6 h-6" />
          </button>

          {/* 4. Create Event */}
          <button
            onClick={() => setActiveSheet('createEvent')}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-zinc-400 hover:text-fuchsia-300 touch-feedback transition-colors"
          >
            <CalendarPlus className="w-5 h-5 text-fuchsia-400" />
            <span className="text-[10px] font-bold tracking-tight">Event</span>
          </button>
        </div>
      </nav>

      {/* 1. Add Debt Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'addDebt'}
        onClose={() => setActiveSheet('none')}
        title={t.addDebt || 'Add Debt'}
        icon={<PlusCircle className="w-5 h-5 text-purple-400" />}
      >
        <form
          action={async (fd) => {
            await createDebt(fd)
            setActiveSheet('none')
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {t.selectUser || 'Select User'}
            </label>
            <select
              name="userId"
              required
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 bg-black/60"
            >
              <option value="">{t.selectUser || 'Select user...'}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-zinc-900 text-zinc-100">
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {t.desc || 'Description'}
            </label>
            <input
              type="text"
              name="description"
              required
              placeholder="e.g. Dinner, Drinks, Uber"
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {t.amount || 'Amount (COP)'}
            </label>
            <input
              type="number"
              name="amount"
              required
              placeholder="e.g. 50000"
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <SubmitButton
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg touch-feedback cursor-pointer"
          >
            {t.addBtn || 'Add Debt'}
          </SubmitButton>
        </form>
      </BottomSheet>

      {/* 2. Log Payment Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'logPayment'}
        onClose={() => setActiveSheet('none')}
        title={t.logPayment || 'Log Payment'}
        icon={<Wallet className="w-5 h-5 text-emerald-400" />}
      >
        <form
          action={async (fd) => {
            await createPayment(fd)
            setActiveSheet('none')
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {t.selectUser || 'Select User'}
            </label>
            <select
              name="userId"
              required
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 bg-black/60"
            >
              <option value="">{t.selectUser || 'Select user...'}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-zinc-900 text-zinc-100">
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {t.amount || 'Amount (COP)'}
            </label>
            <input
              type="number"
              name="amount"
              required
              placeholder="e.g. 30000"
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <SubmitButton
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg touch-feedback cursor-pointer"
          >
            {t.logPayment || 'Confirm Payment'}
          </SubmitButton>
        </form>
      </BottomSheet>

      {/* 3. AI Parser Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'parser'}
        onClose={() => setActiveSheet('none')}
        title="AI Text Parser"
        icon={<Wand2 className="w-5 h-5 text-cyan-400" />}
      >
        <AdminParser users={users} />
      </BottomSheet>

      {/* 4. Create Event Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'createEvent'}
        onClose={() => setActiveSheet('none')}
        title="Create New Event"
        icon={<CalendarPlus className="w-5 h-5 text-fuchsia-400" />}
      >
        <form
          action={async (fd) => {
            selectedUsers.forEach((uid) => fd.append('invited_users', uid))
            if (selectedImage) fd.append('image_url', selectedImage)
            await createEvent(fd)
            setActiveSheet('none')
            setSelectedUsers([])
            setSelectedImage(null)
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. House Party, Concert, Trip"
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                name="event_date"
                required
                className="w-full p-3 glass-input rounded-2xl text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Fandi's House"
                className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Total Price (COP)
            </label>
            <input
              type="number"
              name="price"
              required
              placeholder="e.g. 150000"
              className="w-full p-3 glass-input rounded-2xl text-sm text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Invite Users ({selectedUsers.length} selected)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 glass-panel rounded-2xl">
              {users.map((u) => {
                const isSelected = selectedUsers.includes(u.id)
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors touch-feedback ${
                      isSelected
                        ? 'bg-fuchsia-500 text-white shadow-md'
                        : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                    }`}
                  >
                    {u.username}
                  </button>
                )
              })}
            </div>
          </div>

          <SubmitButton
            className="w-full py-3.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg touch-feedback cursor-pointer"
          >
            Create Event & Send Invites
          </SubmitButton>
        </form>
      </BottomSheet>
    </>
  )
}
