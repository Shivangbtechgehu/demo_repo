const { z } = require('zod');
const { failure } = require('../../utils/response');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100, 'Name must be at most 100 characters long.'),
  email: z.string().trim().email('Enter a valid email address.').max(254, 'Email must be at most 254 characters long.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.').max(128, 'Password must be at most 128 characters long.'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  otp: z.string().trim().length(6, 'OTP must be 6 digits.').regex(/^\d+$/, 'OTP must be numeric.'),
});

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return failure(res, 400, 'VALIDATION_ERROR', 'Request validation failed.', formatZodIssues(result.error.issues));
    }

    req.body = result.data;
    return next();
  };
}

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  validateBody,
};
