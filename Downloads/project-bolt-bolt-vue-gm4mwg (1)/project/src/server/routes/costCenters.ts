import { Router } from 'express'
import { protect, requireRole } from '../middleware/auth'
import {
  createCostCenter,
  getCostCenters,
  updateCostCenter,
  deleteCostCenter,
  addCostType
} from '../controllers/costCenter.controller'

const router = Router()

router.use(protect)

router.route('/')
  .get(getCostCenters)
  .post(requireRole(['admin', 'manager']), createCostCenter)

router.route('/:id')
  .put(requireRole(['admin', 'manager']), updateCostCenter)
  .delete(requireRole(['admin']), deleteCostCenter)

router.post('/:centerId/types', requireRole(['admin', 'manager']), addCostType)

export const costCenterRoutes = router