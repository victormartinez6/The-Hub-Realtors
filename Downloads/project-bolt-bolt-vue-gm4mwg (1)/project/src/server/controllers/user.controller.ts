import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { CreateUserSchema, UpdateUserSchema } from '../validators/user.validator'

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const data = CreateUserSchema.parse(req.body)

  const existingUser = await db.select()
    .from(users)
    .where(eq(users.email, data.email))
    .get()

  if (existingUser) {
    res.status(400)
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await db.insert(users).values({
    ...data,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning().get()

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  })
})

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const usersList = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    active: users.active,
    createdAt: users.createdAt
  })
  .from(users)
  .where(eq(users.active, true))
  .all()

  res.json(usersList)
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = UpdateUserSchema.parse(req.body)

  let updateData = { ...data }
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  const user = await db.update(users)
    .set({
      ...updateData,
      updatedAt: new Date().toISOString()
    })
    .where(eq(users.id, parseInt(id)))
    .returning()
    .get()

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  })
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const user = await db.update(users)
    .set({ 
      active: false,
      updatedAt: new Date().toISOString()
    })
    .where(eq(users.id, parseInt(id)))
    .returning()
    .get()

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.json({ message: 'User deleted successfully' })
})