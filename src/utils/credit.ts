export interface DebtForCredit {
  id: string
  amount: number | string
  paid_amount: number | string
  status: string
  is_loan: boolean
  created_at: string
  fully_paid_at?: string | null
}

export function calculateDebtInterest(debt: DebtForCredit) {
  if (!debt.is_loan) return 0
  const createdDate = new Date(debt.created_at)
  const endDate = debt.fully_paid_at && debt.status === 'paid' ? new Date(debt.fully_paid_at) : new Date()
  
  const diffTime = Math.abs(endDate.getTime() - createdDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const daysPassed = Math.max(0, diffDays)
  
  // Accumulated Interest = Original amount * 0.051% * Days
  const originalAmount = Number(debt.amount)
  const interest = originalAmount * 0.00051 * daysPassed
  return interest
}

export function calculateCreditScore(debts: DebtForCredit[]) {
  let score = 0
  let isSuspended = false

  for (const debt of debts) {
    const createdDate = new Date(debt.created_at)
    // If it's paid, use fully_paid_at. If pending, use today's date to measure age.
    const endDate = debt.status === 'paid' && debt.fully_paid_at ? new Date(debt.fully_paid_at) : new Date()
    
    const diffTime = Math.abs(endDate.getTime() - createdDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Rule mapping exactly to user request:
    if (diffDays <= 30 && debt.status === 'paid') {
      score += 1
    }
    
    if (diffDays > 30 && diffDays <= 90) {
      score -= 1
    } else if (diffDays > 90 && diffDays <= 180) {
      score -= 2
    } else if (diffDays > 180) {
      score -= 3
      if (debt.status === 'pending') {
        isSuspended = true
      }
    }
  }

  return { score, isSuspended }
}
