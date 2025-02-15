import { z } from 'zod'

const CostCenterSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional()
})

const CostTypeSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional()
})

export const CreateCostCenterSchema = CostCenterSchema

export const UpdateCostCenterSchema = CostCenterSchema.partial()

export const CreateCostTypeSchema = CostTypeSchema

export const UpdateCostTypeSchema = CostTypeSchema.partial()