import { Router } from 'express'
import { protect } from '../middleware/auth'
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplier.controller'

const router = Router()

router.use(protect)

router.route('/')
  .get(getSuppliers)
  .post(createSupplier)

router.route('/:id')
  .put(updateSupplier)
  .delete(deleteSupplier)

export const supplierRoutes = router