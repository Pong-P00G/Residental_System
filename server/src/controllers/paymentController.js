import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as paymentService from '../services/paymentService.js';

// GET /api/v1/payments
export const listPayments = catchAsync(async (req, res) => {
    const result = await paymentService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// POST /api/v1/payments — owner (with canRecordPayments) or admin
export const createPayment = catchAsync(async (req, res) => {
    const { payment, idempotent } = await paymentService.create(actorFrom(req), req.body);

    res.status(idempotent ? 200 : 201).json({
        success: true,
        data: payment,
        ...(idempotent ? { meta: { idempotent: true } } : {}),
    });
});

// GET /api/v1/payments/:paymentId
export const getPayment = catchAsync(async (req, res) => {
    const result = await paymentService.getById(actorFrom(req), req.params.paymentId);

    res.status(200).json({ success: true, data: result });
});

// PATCH /api/v1/payments/:paymentId — owner (with canRecordPayments) or admin
export const updatePayment = catchAsync(async (req, res) => {
    const payment = await paymentService.update(actorFrom(req), req.params.paymentId, req.body);

    res.status(200).json({ success: true, data: payment });
});
