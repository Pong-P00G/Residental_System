import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess, requireAdmin, requireOwner } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createRequestValidator, updateRequestStatusValidator } from '../utils/validators/request.validator.js';
import * as requestController from '../controllers/requestController.js';

const router = Router();

// Every request route requires authentication and a resolved property scope
router.use(authenticate);
router.use(resolvePropertyAccess);

// POST /api/v1/requests
// Residents raise requests for their own unit; managers may act for a resident.
router.post('/', validate(createRequestValidator), requestController.createRequest);

// GET /api/v1/requests
// Resident: own requests. Owner: requests in their properties. Admin: everything.
router.get('/', requestController.listRequests);

// GET /api/v1/requests/:requestId
router.get('/:requestId', requestController.getRequest);

// PATCH /api/v1/requests/:requestId/status
// Owner (with canManageRequests) or admin moves the request through its lifecycle.
router.patch(
    '/:requestId/status',
    requireOwner,
    validate(updateRequestStatusValidator),
    requestController.updateRequestStatus
);

// DELETE /api/v1/requests/:requestId
// Admin-only soft delete (kept for audit history).
router.delete('/:requestId', requireAdmin, requestController.deleteRequest);

export default router;
