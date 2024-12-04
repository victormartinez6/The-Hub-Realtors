import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { db } from '../db'
import { transactions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { CreateTransactionSchema, UpdateTransactionSchema } from '../validators/transaction.validator'

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const data = CreateTransactionSchema.parse(req.body)

  const transaction = await db.insert(transactions).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  res.status(201).json(transaction)
})

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, type } = req.query

  let query = db.select().from(transactions).where(eq(transactions.active, true))

  if (startDate && endDate) {
    query = query.where(db.between(transactions.date, startDate as string, endDate as string))
  }

  if (type) {
    query = query.where(eq(transactions.type, type as string))
  }

  const transactionsList = await query.all()
  res.json(transactionsList)
})

export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = UpdateTransactionSchema.parse(req.body)

  const transaction = await db.update(transactions)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(transactions.id, parseInt(id)))
    .returning()
    .get()

  if (!transaction) {
    res.status(404)
    throw new Error('Transaction not found')
  }

  res.json(transaction)
})

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const transaction = await db.update(transactions)
    .set({ 
      active: false,
      updatedAt: new Date().toISOString()
    })
    .where(eq(transactions.id, parseInt(id)))
    .returning()
    .get()

  if (!transaction) {
    res.status(404)
    throw new Error('Transaction not found')
  }

  res.json({ message: 'Transaction deleted successfully' })
})