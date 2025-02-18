import { Router } from 'express';
import { smtpController } from '../controllers/smtp.controller';
import { authMiddleware } from '../middlewares/auth';
import { superAdminMiddleware } from '../middlewares/superAdmin';

const router = Router();

// Todas as rotas requerem autenticação e permissão de super admin
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get('/settings/smtp', smtpController.getConfig);
router.post('/settings/smtp', smtpController.saveConfig);
router.post('/settings/smtp/test', smtpController.testConnection);

export const smtpRoutes = router;
