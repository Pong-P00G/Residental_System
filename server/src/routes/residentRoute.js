import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess, requireOwner } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createResidentValidator, updateResidentValidator } from '../utils/validators/resident.validator.js';
import * as residentController from '../controllers/residentController.js';

const router = Router();

router.use(authenticate);
router.use(resolvePropertyAccess);

// GET /api/v1/residents
// Admin: all. Owner: their properties. Resident: their own record.
router.get('/', residentController.listResidents);

// POST /api/v1/residents — owner (with canEditResidents) or admin
router.post('/', requireOwner, validate(createResidentValidator), residentController.createResident);

// GET /api/v1/residents/:residentId
router.get('/:residentId', residentController.getResident);

// PATCH /api/v1/residents/:residentId — owner (with canEditResidents) or admin
router.patch('/:residentId', requireOwner, validate(updateResidentValidator), residentController.updateResident);

// DELETE /api/v1/residents/:residentId — ends the tenancy, keeps the record
router.delete('/:residentId', requireOwner, residentController.endTenancy);

export default router;
