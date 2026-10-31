import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as propertyService from '../services/propertyService.js';

// GET /api/v1/properties
export const listProperties = catchAsync(async (req, res) => {
    const result = await propertyService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// POST /api/v1/properties — admin only
export const createProperty = catchAsync(async (req, res) => {
    const property = await propertyService.create(actorFrom(req), req.body);

    res.status(201).json({ success: true, data: property });
});

// GET /api/v1/properties/:propertyId
export const getPropertyDetails = catchAsync(async (req, res) => {
    const property = await propertyService.getById(actorFrom(req), req.params.propertyId);

    res.status(200).json({ success: true, data: property });
});

// PATCH /api/v1/properties/:propertyId
export const updateProperty = catchAsync(async (req, res) => {
    const property = await propertyService.update(actorFrom(req), req.params.propertyId, req.body);

    res.status(200).json({ success: true, data: property });
});
