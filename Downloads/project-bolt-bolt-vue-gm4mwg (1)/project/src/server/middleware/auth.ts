import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

interface JwtPayload {
  id: number
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        role: string
      }
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      res.status(401)
      throw new Error('Not authorized, no token')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).get()

    if (!user || !user.active) {
      res.status(401)
      throw new Error('Not authorized')
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    }

    next()
  } catch (error) {
    res.status(401)
    throw new Error('Not authorized')
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403)
      throw new Error('Not authorized, insufficient permissions')
    }
    next()
  }
}