import { AppError } from '../utils/appError.js';

/**
 * Request validation middleware using Zod
 * Accepts a Zod schema object with optional `body`, `query`, and/or `params` properties.
 * Formats validation issues clearly into the standardized error envelope.
 *
 * Example usage:
 * router.post('/example', validate(exampleSchema), exampleController);
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const toValidate = {};
    if (schema.shape?.body) toValidate.body = req.body;
    if (schema.shape?.query) toValidate.query = req.query;
    if (schema.shape?.params) toValidate.params = req.params;

    // If schema has no nested body/query/params keys, validate req.body directly
    const target = (schema.shape?.body || schema.shape?.query || schema.shape?.params)
      ? toValidate
      : req.body;

    const result = schema.safeParse(target);

    if (!result.success) {
      const formattedErrors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return next(new AppError('Request validation failed', 400, formattedErrors));
    }

    // Attach parsed/transformed data back
    if (schema.shape?.body && result.data.body) req.body = result.data.body;
    if (schema.shape?.query && result.data.query) req.query = result.data.query;
    if (schema.shape?.params && result.data.params) req.params = result.data.params;

    next();
  } catch (err) {
    next(err);
  }
};

export default validate;
