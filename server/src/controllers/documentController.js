import catchAsync from '../utils/catchAsync.js';
import { actorFrom } from '../utils/propertyAccess.js';
import { meta } from '../utils/pagination.js';
import * as documentService from '../services/documentService.js';

// GET /api/v1/documents — filtered by the caller's visibility rules
export const listDocuments = catchAsync(async (req, res) => {
    const result = await documentService.list(actorFrom(req), req.query);

    res.status(200).json({ success: true, data: result.items, meta: meta(result) });
});

// POST /api/v1/documents — registers metadata for an already-uploaded file
export const createDocument = catchAsync(async (req, res) => {
    const document = await documentService.create(actorFrom(req), req.body);

    res.status(201).json({ success: true, data: document });
});

// GET /api/v1/documents/:documentId
export const getDocument = catchAsync(async (req, res) => {
    const document = await documentService.getById(actorFrom(req), req.params.documentId);

    res.status(200).json({ success: true, data: document });
});

// PATCH /api/v1/documents/:documentId — uploader, or manager with canUploadDocuments
export const updateDocument = catchAsync(async (req, res) => {
    const document = await documentService.update(actorFrom(req), req.params.documentId, req.body);

    res.status(200).json({ success: true, data: document });
});

// DELETE /api/v1/documents/:documentId — uploader, or manager with canUploadDocuments
export const deleteDocument = catchAsync(async (req, res) => {
    const result = await documentService.remove(actorFrom(req), req.params.documentId);

    res.status(200).json({ success: true, message: 'Document deleted', data: result });
});
