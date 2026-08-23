import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { integrationController } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array(), code: 'VALIDATION_ERROR' });
  }
  next();
}

// Public OAuth callback and error routes (handles redirect from OAuth providers)
router.get('/oauth/error', integrationController.handleOAuthError);
router.get('/oauth/:provider/callback', integrationController.handleCallback);

// Protected routes
router.get('/oauth/:provider/start', protect, integrationController.startOAuth);
router.get('/status', protect, integrationController.getHealthStatus);
router.get('/', protect, integrationController.getIntegrations);
router.delete('/:provider', protect, integrationController.disconnect);

router.post(
  '/',
  protect,
  [
    body('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets']).withMessage('Valid provider is required'),
    body('credentials').notEmpty().withMessage('Credentials payload is required'),
  ],
  validate,
  integrationController.saveCredentials
);

export default router;
