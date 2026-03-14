import express from 'express';
import {
  processVideo,
  getUserVideos,
  getVideoById,
  deleteVideo,
  updateVideo,
  regenerateSummary,
} from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { videoUrlRules } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All video routes require authentication
router.use(protect);

router.post('/process', videoUrlRules, processVideo);
router.get('/', getUserVideos);
router.get('/:id', getVideoById);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);
router.post('/:id/regenerate-summary', regenerateSummary);

export default router;
