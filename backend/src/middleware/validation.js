import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Contact validation rules
export const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be less than 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Phone number must be less than 50 characters'),
  body('company')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Company name must be less than 255 characters'),
  body('jobTitle')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Job title must be less than 255 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('notes')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Notes must be less than 5000 characters'),
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must be less than 1000 characters'),
  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid birthday date'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean value'),
  handleValidationErrors
];

export const validateContactUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be less than 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Phone number must be less than 50 characters'),
  body('company')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Company name must be less than 255 characters'),
  body('jobTitle')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Job title must be less than 255 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('notes')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Notes must be less than 5000 characters'),
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must be less than 1000 characters'),
  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid birthday date'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean value'),
  handleValidationErrors
];

// Tag validation rules
export const validateTag = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tag name is required and must be less than 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

// UUID parameter validation
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search term must be less than 255 characters'),
  handleValidationErrors
];
