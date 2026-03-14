import { body, validationResult } from 'express-validator';

/**
 * Run validation and return errors if any
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Register validation rules
 */
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

/**
 * Login validation rules
 */
export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

/**
 * Video URL validation rules
 */
export const videoUrlRules = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('YouTube URL is required')
    .custom((value) => {
      const youtubePattern =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/;
      if (!youtubePattern.test(value)) {
        throw new Error('Please provide a valid YouTube URL');
      }
      return true;
    }),
  validate,
];
