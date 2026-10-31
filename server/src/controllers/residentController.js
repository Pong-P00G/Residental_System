import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as residentService from '../services/residentService.js';

// GET /api/v1/residents
export const listResidents = catchAsync(async (req, res) => {
    const result = await residentService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// POST /api/v1/residents — owner (with canEditResidents) or admin
export const createResident = catchAsync(async (req, res) => {
    const resident = await residentService.create(actorFrom(req), req.body);

    res.status(201).json({ success: true, data: resident });
});

// GET /api/v1/residents/:residentId
export const getResident = catchAsync(async (req, res) => {
    const resident = await residentService.getById(actorFrom(req), req.params.residentId);

    res.status(200).json({ success: true, data: resident });
});

// PATCH /api/v1/residents/:residentId — owner (with canEditResidents) or admin
export const updateResident = catchAsync(async (req, res) => {
    const resident = await residentService.update(actorFrom(req), req.params.residentId, req.body);

    res.status(200).json({ success: true, data: resident });
});

// DELETE /api/v1/residents/:residentId — ends the tenancy, keeps the record
export const endTenancy = catchAsync(async (req, res) => {
    const resident = await residentService.endTenancy(actorFrom(req), req.params.residentId);

    res.status(200).json({ success: true, message: 'Tenancy ended', data: resident });
});
