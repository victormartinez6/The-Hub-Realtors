import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import { db } from '../db'
import { users } from '../db/schema'
import { generateToken } from '../utils/jwt'
import { eq } from 'drizzle-orm'
import { LoginSchema, RegisterSchema } from '../validators/auth.validator'

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body)

  const user = await db.select().from(users).where(eq(users.email, email)).get()

  if (!user || !user.active) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  res.json({
    token: generateToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = RegisterSchema.parse(req.body)
  
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
    token: generateToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})