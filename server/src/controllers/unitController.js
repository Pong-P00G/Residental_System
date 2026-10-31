import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as unitService from '../services/unitService.js';

// GET /api/v1/units
export const listUnits = catchAsync(async (req, res) => {
    const result = await unitService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// POST /api/v1/units — owner (with canManageUnits) or admin
export const createUnit = catchAsync(async (req, res) => {
    const unit = await unitService.create(actorFrom(req), req.body);

    res.status(201).json({ success: true, data: unit });
});

// GET /api/v1/units/:unitId
export const getUnit = catchAsync(async (req, res) => {
    const unit = await unitService.getById(actorFrom(req), req.params.unitId);

    res.status(200).json({ success: true, data: unit });
});

// PATCH /api/v1/units/:unitId — owner (with canManageUnits) or admin
export const updateUnit = catchAsync(async (req, res) => {
    const unit = await unitService.update(actorFrom(req), req.params.unitId, req.body);

    res.status(200).json({ success: true, data: unit });
});
