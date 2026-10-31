import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess, requireOwner } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createLeaseValidator, updateLeaseValidator } from '../utils/validators/lease.validator.js';
import * as leaseController from '../controllers/leaseController.js';

const router = Router();

router.use(authenticate);
router.use(resolvePropertyAccess);

// GET /api/v1/leases
// Admin: all. Owner: their properties. Resident: leases they are a party to.
router.get('/', leaseController.listLeases);

// POST /api/v1/leases — owner (with canManageLeases) or admin
router.post('/', requireOwner, validate(createLeaseValidator), leaseController.createLease);

// GET /api/v1/leases/:leaseId
router.get('/:leaseId', leaseController.getLease);

// PATCH /api/v1/leases/:leaseId — owner (with canManageLeases) or admin
router.patch('/:leaseId', requireOwner, validate(updateLeaseValidator), leaseController.updateLease);

export default router;
