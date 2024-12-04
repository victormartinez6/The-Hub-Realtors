import { Router } from 'express'
import { protect, requireRole } from '../middleware/auth'
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser
} from '../controllers/user.controller'

const router = Router()

router.use(protect)
router.use(requireRole(['admin']))

router.route('/')
  .get(getUsers)
  .post(createUser)

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser)

export const userRoutes = router