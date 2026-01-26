import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';

const router = Router();
const trackingController = new TrackingController();

// Public route
router.get('/:trackingId', trackingController.getTrackingDetails);

export default router;
