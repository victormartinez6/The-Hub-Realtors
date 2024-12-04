import { z } from 'zod'

const BankSchema = z.object({
  name: z.string().min(2, 'Nome do banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  initialBalance: z.number().min(0, 'Saldo inicial não pode ser negativo'),
  initialBalanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
})

export const CreateBankSchema = BankSchema

export const UpdateBankSchema = BankSchema.partial()