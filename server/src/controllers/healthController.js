import { successResponse } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';
import { getDBHealth } from '../config/db.js';

/**
 * Health Check Controller
 * Returns comprehensive runtime diagnostics including uptime,
 * memory consumption, environment, and MongoDB connection status.
 */
export const getHealth = (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

  const memory = process.memoryUsage();

  return successResponse(res, {
    message: 'WorkBridge API service is healthy',
    data: {
      status: 'online',
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: formattedUptime,
      uptimeSeconds,
      memory: {
        rssMB: (memory.rss / (1024 * 1024)).toFixed(2),
        heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(2)
      },
      database: getDBHealth()
    }
  });
};

export default {
  getHealth
};
