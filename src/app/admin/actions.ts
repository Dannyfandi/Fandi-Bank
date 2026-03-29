'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateDebtInterest, DebtForCredit } from '@/utils/credit'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return supabase
}

export async function applyBulkDebtsAndPayments(formData: FormData) {
  const supabase = await checkAdmin()
  const userId = formData.get('userId') as string
  const entriesJson = formData.get('entries') as string
  const entries = JSON.parse(entriesJson) as Array<{type: 'debt' | 'payment', amount: number, description: string}>

  const { data: profile } = await supabase.from('profiles').select('credit_balance').eq('id', userId).single()
  let currentCredit = Number(profile?.credit_balance || 0)

  for (const entry of entries) {
    if (entry.type === 'debt') {
      let remainingDebt = entry.amount
      let paidAmt = 0
      
      if (currentCredit > 0) {
         if (currentCredit >= remainingDebt) {
            paidAmt = remainingDebt
            currentCredit -= remainingDebt
            remainingDebt = 0
         } else {
            paidAmt = currentCredit
            remainingDebt -= currentCredit
            currentCredit = 0
         }
      }

      await supabase.from('debts').insert({
        user_id: userId,
        description: entry.description,
        amount: entry.amount,
        paid_amount: paidAmt,
        status: remainingDebt === 0 ? 'paid' : 'pending',
        fully_paid_at: remainingDebt === 0 ? new Date().toISOString() : null,
      })
    } else if (entry.type === 'payment') {
      let paymentRemaining = entry.amount
      
      const { data: paymentRecord } = await supabase.from('payments').insert({
        user_id: userId,
        total_amount: entry.amount
      }).select('id').single()
      
      if (!paymentRecord) continue;
      const paymentId = paymentRecord.id

      const { data: pendingDebts } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (pendingDebts) {
        for (const pd of pendingDebts) {
           const dbAmt = Number(pd.amount)
           const interestAmt = calculateDebtInterest(pd as DebtForCredit) // NEW V3 LOGIC
           const dbPaid = Number(pd.paid_amount)
           const dbMissing = (dbAmt + interestAmt) - dbPaid

           if (paymentRemaining <= 0) break;

           let newlyAllocated = 0
           let newStatus = 'pending'

           if (paymentRemaining >= dbMissing) {
             newlyAllocated = dbMissing
             paymentRemaining -= dbMissing
             newStatus = 'paid'
           } else {
             newlyAllocated = paymentRemaining
             paymentRemaining = 0
           }

           await supabase.from('payment_allocations').insert({
              payment_id: paymentId,
              debt_id: pd.id,
              allocated_amount: newlyAllocated
           })

           const updatePayload: any = {
              paid_amount: dbPaid + newlyAllocated,
              status: newStatus
           }
           if (newStatus === 'paid') {
              updatePayload.fully_paid_at = new Date().toISOString()
           }
           await supabase.from('debts').update(updatePayload).eq('id', pd.id)
        }
      }

      if (paymentRemaining > 0) {
        currentCredit += paymentRemaining
      }
    }
  }

  await supabase.from('profiles').update({ credit_balance: currentCredit }).eq('id', userId)
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

// Wrapper since applyBulk requires 'FormData' directly, avoiding code duplication
async function applyBulkBulkWrapper(formData: FormData) {
  return applyBulkDebtsAndPayments(formData)
}

export async function createDebt(formData: FormData) {
  const userId = formData.get('userId') as string
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  
  if (!userId || !description || isNaN(amount)) throw new Error('Invalid input')

  const safeFormData = new FormData()
  safeFormData.append('userId', userId)
  safeFormData.append('entries', JSON.stringify([{ type: 'debt', amount, description }]))
  
  await applyBulkBulkWrapper(safeFormData)
}

export async function createPayment(formData: FormData) {
  const userId = formData.get('userId') as string
  const description = formData.get('description') as string || 'Manual Payment'
  const amount = parseFloat(formData.get('amount') as string)
  
  if (!userId || isNaN(amount)) throw new Error('Invalid input')

  const safeFormData = new FormData()
  safeFormData.append('userId', userId)
  safeFormData.append('entries', JSON.stringify([{ type: 'payment', amount, description }]))
  
  await applyBulkBulkWrapper(safeFormData)
}

export async function deleteDebt(formData: FormData) {
  const supabase = await checkAdmin()
  const debtId = formData.get('debtId') as string
  await supabase.from('debts').delete().eq('id', debtId)
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function markDebtPaid(formData: FormData) {
  const supabase = await checkAdmin()
  const debtId = formData.get('debtId') as string
  await supabase.from('debts').update({ status: 'paid', fully_paid_at: new Date().toISOString() }).eq('id', debtId)
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updateTicketRequestStatus(formData: FormData) {
  const supabase = await checkAdmin()
  const reqId = formData.get('reqId') as string
  const status = formData.get('status') as string

  await supabase.from('ticket_requests').update({ status }).eq('id', reqId)
  revalidatePath('/admin')
}

export async function updateLoanStatus(formData: FormData) {
  const supabase = await checkAdmin()
  const loanId = formData.get('loanId') as string
  const status = formData.get('status') as string

  const { data: loan } = await supabase.from('loan_requests').select('*').eq('id', loanId).single()
  if (!loan) throw new Error('Loan not found')

  if (status === 'approved') {
    await supabase.from('debts').insert({
      user_id: loan.user_id,
      description: `Fandi Bank Loan (#${loanId.split('-')[0]})`,
      amount: loan.amount,
      is_loan: true,
      status: 'pending'
    })
  }
  
  await supabase.from('loan_requests').update({ status }).eq('id', loanId)
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updateVisitStatus(formData: FormData) {
  const supabase = await checkAdmin()
  const visitId = formData.get('visitId') as string
  const status = formData.get('status') as string

  await supabase.from('visit_requests').update({ status }).eq('id', visitId)
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function reversePayment(formData: FormData) {
  const supabase = await checkAdmin()
  const paymentId = formData.get('paymentId') as string

  // Get the payment
  const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single()
  if (!payment) throw new Error('Payment not found')

  const userId = payment.user_id
  const totalAmount = Number(payment.total_amount)

  // Get allocations
  const { data: allocations } = await supabase.from('payment_allocations').select('*').eq('payment_id', paymentId)
  
  let allocatedSum = 0

  if (allocations && allocations.length > 0) {
    for (const alloc of allocations) {
      allocatedSum += Number(alloc.allocated_amount)
      
      // Revert debt
      const { data: debt } = await supabase.from('debts').select('*').eq('id', alloc.debt_id).single()
      if (debt) {
        const newPaidAmount = Math.max(0, Number(debt.paid_amount || 0) - Number(alloc.allocated_amount))
        await supabase.from('debts').update({
          paid_amount: newPaidAmount,
          status: 'pending',
          fully_paid_at: null
        }).eq('id', debt.id)
      }
    }
  }

  // Calculate if any portion went to credit 
  // (the logic in applyBulkDebtsAndPayments puts remainder to credit)
  const creditToRevert = totalAmount - allocatedSum
  
  if (creditToRevert > 0) {
    const { data: profile } = await supabase.from('profiles').select('credit_balance').eq('id', userId).single()
    if (profile) {
      const currentCredit = Number(profile.credit_balance || 0)
      const newCredit = Math.max(0, currentCredit - creditToRevert)
      await supabase.from('profiles').update({ credit_balance: newCredit }).eq('id', userId)
    }
  }

  // Delete payment allocations and payment
  await supabase.from('payment_allocations').delete().eq('payment_id', paymentId)
  await supabase.from('payments').delete().eq('id', paymentId)

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function createEvent(formData: FormData) {
  const supabase = await checkAdmin()
  const title = formData.get('title') as string
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string
  const location = formData.get('location') as string || 'Mojo Dojo Casa House'
  const userIds = JSON.parse(formData.get('userIds') as string || '[]')
  const posterFile = formData.get('posterFile') as File | null

  // Ensure parsing uses Bogota, Colombia time (-05:00) so it saves the correct hour
  const eventDate = new Date(`${dateStr}T${timeStr}:00-05:00`).toISOString()

  let posterUrl: string | null = null

  if (posterFile && posterFile.size > 0) {
    let fileExt = posterFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(fileExt)) fileExt = 'jpg'
    const fileName = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
    
    const arrayBuffer = await posterFile.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, new Uint8Array(arrayBuffer), {
        cacheControl: '3600',
        upsert: false,
        contentType: posterFile.type || 'image/jpeg'
      })

    if (!uploadError && uploadData) {
       const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
       posterUrl = publicUrl
    }
  }

  const { data: event, error: evtErr } = await supabase.from('events').insert({
    title,
    event_date: eventDate,
    location,
    poster_url: posterUrl
  }).select('id').single()

  if (evtErr || !event) throw new Error('Error creating event')

  if (userIds && userIds.length > 0) {
    const invites = userIds.map((uid: string) => ({
      event_id: event.id,
      user_id: uid,
      status: 'pending'
    }))
    await supabase.from('event_invitations').insert(invites)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function deleteEvent(formData: FormData) {
  const supabase = await checkAdmin()
  const eventId = formData.get('eventId') as string
  await supabase.from('events').delete().eq('id', eventId)
  // visit_requests handles cascading deletes based on schema V9 ON DELETE CASCADE
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updateEvent(formData: FormData) {
  const supabase = await checkAdmin()
  const eventId = formData.get('eventId') as string
  const title = formData.get('title') as string
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string
  const location = formData.get('location') as string || 'Mojo Dojo Casa House'
  const posterFile = formData.get('posterFile') as File | null

  const eventDate = new Date(`${dateStr}T${timeStr}:00-05:00`).toISOString()

  let posterUrl: string | null = null
  if (posterFile && posterFile.size > 0) {
    let fileExt = posterFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(fileExt)) fileExt = 'jpg'
    const fileName = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
    const arrayBuffer = await posterFile.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, new Uint8Array(arrayBuffer), {
        cacheControl: '3600',
        upsert: false,
        contentType: posterFile.type || 'image/jpeg'
      })
    if (!uploadError && uploadData) {
       const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
       posterUrl = publicUrl
    }
  }

  const updatePayload: any = { title, event_date: eventDate, location }
  if (posterUrl) updatePayload.poster_url = posterUrl

  await supabase.from('events').update(updatePayload).eq('id', eventId)

  // Sync the change to derived visit_requests dates
  const eventDateObj = new Date(eventDate)
  const dateOnly = eventDateObj.toISOString().split('T')[0]
  const timeOnly = eventDateObj.toISOString().split('T')[1].slice(0, 5) // HH:MM
  await supabase.from('visit_requests').update({
    visit_date: dateOnly,
    arrival_time: `${timeOnly}:00`
  }).eq('event_id', eventId)

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}
