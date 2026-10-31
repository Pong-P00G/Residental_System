import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess, requireAdmin, requireOwner, requirePermission } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createPropertyValidator, updatePropertyValidator } from '../utils/validators/property.validator.js';
import * as propertyController from '../controllers/propertyController.js';

const router = Router();

// Every property route requires authentication and a resolved property scope
router.use(authenticate);
router.use(resolvePropertyAccess);

// GET /api/v1/properties
// Admin sees all; owner/resident see only their assigned properties.
router.get('/', propertyController.listProperties);

// POST /api/v1/properties
// Only an admin can create a property.
router.post('/', requireAdmin, validate(createPropertyValidator), propertyController.createProperty);

// GET /api/v1/properties/:propertyId
// Any role can read a property they have access to.
router.get('/:propertyId', propertyController.getPropertyDetails);

// PATCH /api/v1/properties/:propertyId
// Owner (with canManageUnits) or admin can update.
router.patch(
    '/:propertyId',
    requireOwner,
    validate(updatePropertyValidator),
    requirePermission('canManageUnits'),
    propertyController.updateProperty
);

export default router;
