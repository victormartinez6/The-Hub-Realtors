import { z } from 'zod'

const TransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  description: z.string().min(3, 'Descrição é obrigatória'),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Valor deve ser positivo'),
  status: z.enum(['pending', 'completed']),
  costTypeId: z.number().optional(),
  bankId: z.number().optional()
})

export const CreateTransactionSchema = TransactionSchema

export const UpdateTransactionSchema = TransactionSchema.partial()