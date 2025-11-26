import express from 'express';
import { triggerCall } from '../controllers/callLoopController.js';
import { getCallHistory } from '../controllers/getCallHistoryController.js';
import { getCallStatistics } from '../controllers/getCallStatisticsController.js';

const router = express.Router();

router.post('/', triggerCall);
router.get('/history/:googleId', getCallHistory);
router.get('/statistics/:googleId', getCallStatistics);

export default router;