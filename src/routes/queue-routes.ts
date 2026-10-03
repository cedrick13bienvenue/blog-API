import { Router } from 'express';
import { EmailQueueService } from '../services/email-queue-service';
import { ResponseService } from '../utils/response';
import { ensureAuthenticated } from '../middlewares/auth';

const queueRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Queue
 *     description: Email queue management endpoints
 *
 * /api/queue/stats:
 *   get:
 *     tags: [Queue]
 *     summary: Get email queue statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     mainQueue:
 *                       type: number
 *                     retryQueue:
 *                       type: number
 *                     deadLetterQueue:
 *                       type: number
 *                     totalJobs:
 *                       type: number
 *
 * /api/queue/clear:
 *   post:
 *     tags: [Queue]
 *     summary: Clear all email queues
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All queues cleared successfully
 *
 * /api/queue/reprocess:
 *   post:
 *     tags: [Queue]
 *     summary: Reprocess dead letter queue
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dead letter queue reprocessed successfully
 */

// Get queue statistics
queueRouter.get('/stats', ensureAuthenticated, async (req, res) => {
  try {
    const stats = await EmailQueueService.getQueueStats();
    
    ResponseService({
      res,
      status: 200,
      message: 'Queue statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to get queue statistics'
    });
  }
});

// Clear all queues
queueRouter.post('/clear', ensureAuthenticated, async (req, res) => {
  try {
    await EmailQueueService.clearAllQueues();
    
    ResponseService({
      res,
      status: 200,
      message: 'All email queues cleared successfully'
    });
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to clear queues'
    });
  }
});

// Reprocess dead letter queue
queueRouter.post('/reprocess', ensureAuthenticated, async (req, res) => {
  try {
    await EmailQueueService.reprocessDeadLetterQueue();
    
    ResponseService({
      res,
      status: 200,
      message: 'Dead letter queue reprocessed successfully'
    });
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to reprocess dead letter queue'
    });
  }
});

export { queueRouter }; 