import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { db } from '../db'
import { costCenters, costTypes } from '../db/schema'
import { eq } from 'drizzle-orm'
import { 
  CreateCostCenterSchema, 
  UpdateCostCenterSchema,
  CreateCostTypeSchema 
} from '../validators/costCenter.validator'

export const createCostCenter = asyncHandler(async (req: Request, res: Response) => {
  const data = CreateCostCenterSchema.parse(req.body)

  const costCenter = await db.insert(costCenters).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  res.status(201).json(costCenter)
})

export const getCostCenters = asyncHandler(async (req: Request, res: Response) => {
  const centers = await db.select().from(costCenters)
    .where(eq(costCenters.active, true))
    .all()

  const centersWithTypes = await Promise.all(centers.map(async (center) => {
    const types = await db.select()
      .from(costTypes)
      .where(eq(costTypes.costCenterId, center.id))
      .where(eq(costTypes.active, true))
      .all()

    return { ...center, types }
  }))

  res.json(centersWithTypes)
})

export const addCostType = asyncHandler(async (req: Request, res: Response) => {
  const { centerId } = req.params
  const data = CreateCostTypeSchema.parse(req.body)

  const costType = await db.insert(costTypes).values({
    ...data,
    costCenterId: parseInt(centerId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  res.status(201).json(costType)
})

export const updateCostCenter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = UpdateCostCenterSchema.parse(req.body)

  const center = await db.update(costCenters)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(costCenters.id, parseInt(id)))
    .returning()
    .get()

  if (!center) {
    res.status(404)
    throw new Error('Cost center not found')
  }

  res.json(center)
})

export const deleteCostCenter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const center = await db.update(costCenters)
    .set({ 
      active: false,
      updatedAt: new Date().toISOString()
    })
    .where(eq(costCenters.id, parseInt(id)))
    .returning()
    .get()

  if (!center) {
    res.status(404)
    throw new Error('Cost center not found')
  }

  res.json({ message: 'Cost center deleted successfully' })
})