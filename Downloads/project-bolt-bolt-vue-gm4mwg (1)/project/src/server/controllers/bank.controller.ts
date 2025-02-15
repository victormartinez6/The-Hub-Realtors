import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { db } from '../db'
import { banks } from '../db/schema'
import { eq } from 'drizzle-orm'
import { CreateBankSchema, UpdateBankSchema } from '../validators/bank.validator'

export const createBank = asyncHandler(async (req: Request, res: Response) => {
  const data = CreateBankSchema.parse(req.body)

  const bank = await db.insert(banks).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  res.status(201).json(bank)
})

export const getBanks = asyncHandler(async (req: Request, res: Response) => {
  const banksList = await db.select().from(banks).where(eq(banks.active, true)).all()
  res.json(banksList)
})

export const updateBank = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = UpdateBankSchema.parse(req.body)

  const bank = await db.update(banks)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(banks.id, parseInt(id)))
    .returning()
    .get()

  if (!bank) {
    res.status(404)
    throw new Error('Bank not found')
  }

  res.json(bank)
})

export const deleteBank = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const bank = await db.update(banks)
    .set({ 
      active: false,
      updatedAt: new Date().toISOString()
    })
    .where(eq(banks.id, parseInt(id)))
    .returning()
    .get()

  if (!bank) {
    res.status(404)
    throw new Error('Bank not found')
  }

  res.json({ message: 'Bank deleted successfully' })
})