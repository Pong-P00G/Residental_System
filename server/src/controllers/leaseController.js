import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as leaseService from '../services/leaseService.js';

// GET /api/v1/leases
export const listLeases = catchAsync(async (req, res) => {
    const result = await leaseService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// POST /api/v1/leases — owner (with canManageLeases) or admin
export const createLease = catchAsync(async (req, res) => {
    const lease = await leaseService.create(actorFrom(req), req.body);

    res.status(201).json({ success: true, data: lease });
});

// GET /api/v1/leases/:leaseId
export const getLease = catchAsync(async (req, res) => {
    const lease = await leaseService.getById(actorFrom(req), req.params.leaseId);

    res.status(200).json({ success: true, data: lease });
});

// PATCH /api/v1/leases/:leaseId — owner (with canManageLeases) or admin
export const updateLease = catchAsync(async (req, res) => {
    const lease = await leaseService.update(actorFrom(req), req.params.leaseId, req.body);

    res.status(200).json({ success: true, data: lease });
});
