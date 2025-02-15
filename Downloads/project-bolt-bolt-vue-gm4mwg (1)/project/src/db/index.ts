import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const client = createClient({
  url: 'file:local.db',
  syncUrl: 'ws://localhost:8080'
})

export const db = drizzle(client, { schema })

// Initialize database
const initDb = async () => {
  try {
    // Create tables if they don't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        document TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `)

    // Check if admin user exists
    const adminExists = await client.execute({
      sql: 'SELECT * FROM users WHERE document = ?',
      args: ['09982919784']
    })

    // Create default admin if it doesn't exist
    if (!adminExists.rows.length) {
      const hashedPassword = await import('bcryptjs').then(bcrypt => 
        bcrypt.hash('@1Mevete23', 10)
      )

      await client.execute({
        sql: `
          INSERT INTO users (name, document, email, password, role, active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          'Admin',
          '09982919784',
          'admin@example.com',
          hashedPassword,
          'admin',
          1,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      })
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

initDb()

export default db