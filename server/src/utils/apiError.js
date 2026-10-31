// Operational error class for API responses

export class ApiError extends Error {
    constructor(statusCode, message, details = undefined, isOperational = true) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.status = statusCode;
        this.details = details;
        this.isOperational = isOperational;
        if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Bad request', details) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message = 'Authentication required') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Insufficient permissions') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Resource already exists', details) {
        return new ApiError(409, message, details);
    }
}

export default ApiError;
