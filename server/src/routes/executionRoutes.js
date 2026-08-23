import { Router } from 'express';
import { executionController } from '../controllers/executionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/timeline', executionController.getTimeline);
router.post('/:id/pause', executionController.pauseExecution);
router.post('/:id/resume', executionController.resumeExecution);
router.post('/:id/cancel', executionController.cancelExecution);

export default router;
