import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { updateUserValidator, updateUserRoleValidator } from '../utils/validators/user.validator.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

// Current user
router.get('/me', userController.getMe);
router.patch('/me', validate(updateUserValidator), userController.updateMe);
router.delete('/me', userController.deleteMe);

// Admin user management
router.get('/', requireAdmin, userController.listUsers);
router.get('/:id', requireAdmin, userController.getUser);
router.patch('/:id/role', requireAdmin, validate(updateUserRoleValidator), userController.updateUserRole);

export default router;
