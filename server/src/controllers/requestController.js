import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as requestService from '../services/requestService.js';

// POST /api/v1/requests
export const createRequest = catchAsync(async (req, res) => {
    const request = await requestService.create(actorFrom(req), req.body);

    res.status(201).json({ success: true, data: request });
});

// GET /api/v1/requests
export const listRequests = catchAsync(async (req, res) => {
    const result = await requestService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// GET /api/v1/requests/:requestId
export const getRequest = catchAsync(async (req, res) => {
    const result = await requestService.getById(actorFrom(req), req.params.requestId);

    res.status(200).json({ success: true, data: result });
});

// PATCH /api/v1/requests/:requestId/status
export const updateRequestStatus = catchAsync(async (req, res) => {
    const request = await requestService.updateStatus(actorFrom(req), req.params.requestId, req.body);

    res.status(200).json({ success: true, data: request });
});

// DELETE /api/v1/requests/:requestId — admin only, soft delete
export const deleteRequest = catchAsync(async (req, res) => {
    await requestService.remove(actorFrom(req), req.params.requestId);

    res.status(200).json({ success: true, message: 'Request deleted successfully' });
});
