import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess, requireOwner } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createUnitValidator, updateUnitValidator } from '../utils/validators/unit.validator.js';
import * as unitController from '../controllers/unitController.js';

const router = Router();

router.use(authenticate);
router.use(resolvePropertyAccess);

// GET /api/v1/units
// Admin: all units. Owner: units in their properties. Resident: their own unit.
router.get('/', unitController.listUnits);

// POST /api/v1/units — owner (with canManageUnits) or admin
router.post('/', requireOwner, validate(createUnitValidator), unitController.createUnit);

// GET /api/v1/units/:unitId
router.get('/:unitId', unitController.getUnit);

// PATCH /api/v1/units/:unitId — owner (with canManageUnits) or admin
router.patch('/:unitId', requireOwner, validate(updateUnitValidator), unitController.updateUnit);

export default router;
