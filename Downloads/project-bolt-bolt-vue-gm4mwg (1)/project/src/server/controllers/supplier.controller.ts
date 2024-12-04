import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { db } from '../db'
import { suppliers, supplierBankAccounts } from '../db/schema'
import { eq } from 'drizzle-orm'
import { CreateSupplierSchema, UpdateSupplierSchema } from '../validators/supplier.validator'

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const data = CreateSupplierSchema.parse(req.body)
  const { bankAccounts, ...supplierData } = data

  const supplier = await db.insert(suppliers).values({
    ...supplierData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  if (bankAccounts && bankAccounts.length > 0) {
    await db.insert(supplierBankAccounts).values(
      bankAccounts.map(account => ({
        ...account,
        supplierId: supplier.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    )
  }

  res.status(201).json(supplier)
})

export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const suppliersList = await db.select().from(suppliers)
    .where(eq(suppliers.active, true))
    .all()

  const suppliersWithAccounts = await Promise.all(suppliersList.map(async (supplier) => {
    const accounts = await db.select()
      .from(supplierBankAccounts)
      .where(eq(supplierBankAccounts.supplierId, supplier.id))
      .where(eq(supplierBankAccounts.active, true))
      .all()

    return { ...supplier, bankAccounts: accounts }
  }))

  res.json(suppliersWithAccounts)
})

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = UpdateSupplierSchema.parse(req.body)
  const { bankAccounts, ...supplierData } = data

  const supplier = await db.update(suppliers)
    .set({
      ...supplierData,
      updatedAt: new Date().toISOString()
    })
    .where(eq(suppliers.id, parseInt(id)))
    .returning()
    .get()

  if (!supplier) {
    res.status(404)
    throw new Error('Supplier not found')
  }

  if (bankAccounts) {
    // Soft delete existing accounts
    await db.update(supplierBankAccounts)
      .set({ active: false })
      .where(eq(supplierBankAccounts.supplierId, supplier.id))

    // Add new accounts
    if (bankAccounts.length > 0) {
      await db.insert(supplierBankAccounts).values(
        bankAccounts.map(account => ({
          ...account,
          supplierId: supplier.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      )
    }
  }

  res.json(supplier)
})

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const supplier = await db.update(suppliers)
    .set({ 
      active: false,
      updatedAt: new Date().toISOString()
    })
    .where(eq(suppliers.id, parseInt(id)))
    .returning()
    .get()

  if (!supplier) {
    res.status(404)
    throw new Error('Supplier not found')
  }

  // Soft delete associated bank accounts
  await db.update(supplierBankAccounts)
    .set({ active: false })
    .where(eq(supplierBankAccounts.supplierId, supplier.id))

  res.json({ message: 'Supplier deleted successfully' })
})