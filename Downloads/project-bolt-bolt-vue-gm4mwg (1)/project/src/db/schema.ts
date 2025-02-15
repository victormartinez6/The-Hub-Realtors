import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  document: text('document').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'manager', 'user'] }).notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const banks = sqliteTable('banks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  agency: text('agency').notNull(),
  account: text('account').notNull(),
  initialBalance: real('initial_balance').notNull(),
  initialBalanceDate: text('initial_balance_date').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const costCenters = sqliteTable('cost_centers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const costTypes = sqliteTable('cost_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  costCenterId: integer('cost_center_id').references(() => costCenters.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amount: real('amount').notNull(),
  status: text('status', { enum: ['pending', 'completed'] }).notNull(),
  costTypeId: integer('cost_type_id').references(() => costTypes.id),
  bankId: integer('bank_id').references(() => banks.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})