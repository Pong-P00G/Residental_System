import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resolvePropertyAccess } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { createDocumentValidator, updateDocumentValidator } from '../utils/validators/document.validator.js';
import * as documentController from '../controllers/documentController.js';

const router = Router();

router.use(authenticate);
router.use(resolvePropertyAccess);

// GET /api/v1/documents — filtered by the caller's visibility rules
router.get('/', documentController.listDocuments);

// POST /api/v1/documents — registers metadata for an already-uploaded file
router.post('/', validate(createDocumentValidator), documentController.createDocument);

// GET /api/v1/documents/:documentId
router.get('/:documentId', documentController.getDocument);

// PATCH /api/v1/documents/:documentId — uploader, or manager with canUploadDocuments
router.patch('/:documentId', validate(updateDocumentValidator), documentController.updateDocument);

// DELETE /api/v1/documents/:documentId — uploader, or manager with canUploadDocuments
router.delete('/:documentId', documentController.deleteDocument);

export default router;
