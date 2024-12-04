import { Router } from 'express'
import { protect, requireRole } from '../middleware/auth'
import { createBank, getBanks, updateBank, deleteBank } from '../controllers/bank.controller'

const router = Router()

router.use(protect)

router.route('/')
  .get(getBanks)
  .post(requireRole(['admin', 'manager']), createBank)

router.route('/:id')
  .put(requireRole(['admin', 'manager']), updateBank)
  .delete(requireRole(['admin']), deleteBank)

export const bankRoutes = router