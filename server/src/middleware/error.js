import mongoose from 'mongoose';
import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';

const normaliseError = (err) => {
    if (err instanceof ApiError) {
        return { statusCode: err.statusCode, message: err.message, details: err.details };
    }

    if (err instanceof mongoose.Error.ValidationError) {
        return {
            statusCode: 422,
            message: 'Validation failed',
            details: Object.values(err.errors).map((error) => ({
                field: error.path,
                message: error.message,
            })),
        };
    }

    if (err instanceof mongoose.Error.CastError) {
        return { statusCode: 400, message: `Invalid value for ${err.path}` };
    }

    if (err?.code === 11000) {
        const fields = Object.keys(err.keyPattern || err.keyValue || {});
        return {
            statusCode: 409,
            message: `${fields.join(', ') || 'Value'} already in use`,
            details: fields.map((field) => ({ field, message: 'Must be unique' })),
        };
    }

    if (err?.type === 'entity.parse.failed') {
        return { statusCode: 400, message: 'Malformed JSON body' };
    }

    if (err?.type === 'entity.too.large') {
        return { statusCode: 413, message: 'Request body is too large' };
    }

    return {
        statusCode: err.statusCode || 500,
        message: err.message || 'Internal server error',
        details: err.details,
    };
};

export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

// Global error handler — must be the last middleware registered.
export const errorHandler = (err, req, res, next) => {
    const { statusCode, message, details } = normaliseError(err);

    if (statusCode >= 500) {
        logger.error(message, err.stack, { url: req.originalUrl, method: req.method });
    } else {
        logger.debug(message, { url: req.originalUrl, method: req.method });
    }

    const body = { success: false, message };
    if (details) body.details = details;
    if (statusCode >= 500 && process.env.NODE_ENV !== 'production') body.stack = err.stack;

    res.status(statusCode).json(body);
};

export default errorHandler;
