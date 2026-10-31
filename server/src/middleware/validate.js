// Validates and sanitizes request data with a zod schema.
// Only the body is reassigned; req.query stays untouched (Express 5 getter).
import ApiError from '../utils/apiError.js';

const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
        const details = result.error.issues.map((issue) => ({
            field: issue.path.join('.') || source,
            message: issue.message,
        }));
        return next(new ApiError(422, 'Validation failed', details));
    }

    if (source === 'body') {
        req.body = result.data;
    }

    next();
};

export default validate;
export { validate };
