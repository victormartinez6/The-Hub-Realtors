import { z } from 'zod'

const UserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  document: z.string().min(11, 'CPF/CNPJ inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['admin', 'manager', 'user'])
})

export const CreateUserSchema = UserSchema

export const UpdateUserSchema = UserSchema.partial()