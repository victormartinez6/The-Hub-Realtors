import { Router } from 'express'
import { protect } from '../middleware/auth'
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transaction.controller'

const router = Router()

router.use(protect)

router.route('/')
  .get(getTransactions)
  .post(createTransaction)

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction)

export const transactionRoutes = router