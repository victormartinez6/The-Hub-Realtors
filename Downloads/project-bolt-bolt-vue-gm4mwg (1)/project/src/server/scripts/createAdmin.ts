import { db } from '../db'
import { users } from '../db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, 'admin@example.com'))
      .get()

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10)

    await db.insert(users).values({
      name: 'Administrador',
      email: 'admin@example.com',
      document: '00000000000',
      password: hashedPassword,
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    console.log('Admin user created successfully')
    console.log('Email: admin@example.com')
    console.log('Password: Admin@123')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    process.exit()
  }
}

createAdminUser()