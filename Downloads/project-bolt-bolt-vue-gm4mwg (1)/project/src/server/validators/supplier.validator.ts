import { z } from 'zod'

const AddressSchema = z.object({
  cep: z.string().length(8, 'CEP deve ter 8 dígitos'),
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres')
})

const BankAccountSchema = z.object({
  bank: z.string().min(2, 'Nome do banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  type: z.enum(['checking', 'savings']),
  pixKey: z.string().optional()
})

const SupplierSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  document: z.string().min(11, 'CPF/CNPJ inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: AddressSchema,
  bankAccounts: z.array(BankAccountSchema).optional()
})

export const CreateSupplierSchema = SupplierSchema

export const UpdateSupplierSchema = SupplierSchema.partial()