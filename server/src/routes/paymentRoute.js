import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess, requireOwner } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createPaymentValidator, updatePaymentValidator } from '../utils/validators/payment.validator.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.use(authenticate);
router.use(resolvePropertyAccess);

// GET /api/v1/payments
// Resident: own payments. Owner: their properties. Admin: everything.
router.get('/', paymentController.listPayments);

// POST /api/v1/payments — owner (with canRecordPayments) or admin
router.post('/', requireOwner, validate(createPaymentValidator), paymentController.createPayment);

// GET /api/v1/payments/:paymentId
router.get('/:paymentId', paymentController.getPayment);

// PATCH /api/v1/payments/:paymentId — owner (with canRecordPayments) or admin
router.patch('/:paymentId', requireOwner, validate(updatePaymentValidator), paymentController.updatePayment);

export default router;
