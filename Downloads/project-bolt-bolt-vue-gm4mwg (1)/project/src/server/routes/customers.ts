import { Router } from 'express'
import { protect } from '../middleware/auth'
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} from '../controllers/customer.controller'

const router = Router()

router.use(protect)

router.route('/')
  .get(getCustomers)
  .post(createCustomer)

router.route('/:id')
  .put(updateCustomer)
  .delete(deleteCustomer)

export const customerRoutes = router