import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { workflowController } from '../controllers/workflowController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array(), code: 'VALIDATION_ERROR' });
  }
  next();
}

// All workflow routes require authentication
router.use(protect);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.listWorkflows);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validate,
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt cannot be empty'),
  ],
  validate,
  workflowController.generateWorkflow
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

export default router;
