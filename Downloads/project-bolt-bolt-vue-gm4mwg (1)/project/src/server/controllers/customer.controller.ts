import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { db } from '../db'
import { customers, customerBankAccounts } from '../db/schema'
import { eq } from 'drizzle-orm'
import { CreateCustomerSchema, UpdateCustomerSchema } from '../validators/customer.validator'

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const data = CreateCustomerSchema.parse(req.body)
  const { bankAccounts, ...customerData } = data

  const customer = await db.insert(customers).values({
    ...customerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  if (bankAccounts && bankAccounts.length > 0) {
    await db.insert(customerBankAccounts).values(
      bankAccounts.map(account => ({
        ...account,
        customerId: customer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    )
  }

  res.status(201).json(customer)
})

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const customersList = await db.select().from(customers)
    .where(eq(customers.active, true))
    .all()

  const customersWithAccounts = await Promise.all(customersList.map(async (customer) => {
    const accounts = await db.select()
      .from(customerBankAccounts)
      .where(eq(customerBankAccounts.customerId, customer.id))
      .where(eq(customerBankAccounts.active, true))
      .all()

    return { ...customer, bankAccounts: accounts }
  }))

  res.json(customersWithAccounts)
})

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = UpdateCustomerSchema.parse(req.body)
  const { bankAccounts, ...customerData } = data

  const customer = await db.update(customers)
    .set({
      ...customerData,
      updatedAt: new Date().toISOString()
    })
    .where(eq(customers.id, parseInt(id)))
    .returning()
    .get()

  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }

  if (bankAccounts) {
    // Soft delete existing accounts
    await db.update(customerBankAccounts)
      .set({ active: false })
      .where(eq(customerBankAccounts.customerId, customer.id))

    // Add new accounts
    if (bankAccounts.length > 0) {
      await db.insert(customerBankAccounts).values(
        bankAccounts.map(account => ({
          ...account,
          customerId: customer.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      )
    }
  }

  res.json(customer)
})

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const customer = await db.update(customers)
    .set({ 
      active: false,
      updatedAt: new Date().toISOString()
    })
    .where(eq(customers.id, parseInt(id)))
    .returning()
    .get()

  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }

  // Soft delete associated bank accounts
  await db.update(customerBankAccounts)
    .set({ active: false })
    .where(eq(customerBankAccounts.customerId, customer.id))

  res.json({ message: 'Customer deleted successfully' })
})