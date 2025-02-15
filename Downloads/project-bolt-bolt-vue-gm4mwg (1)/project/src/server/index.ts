import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { bankRoutes } from './routes/banks'
import { costCenterRoutes } from './routes/costCenters'
import { supplierRoutes } from './routes/suppliers'
import { customerRoutes } from './routes/customers'
import { transactionRoutes } from './routes/transactions'

config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/banks', bankRoutes)
app.use('/api/cost-centers', costCenterRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/transactions', transactionRoutes)

// Error Handler
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})