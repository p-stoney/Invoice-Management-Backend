import winston from 'winston';
import { serverConfig } from '../config/serverConfig';

/**
 * Logger utility using Winston for logging application activities.
 * Configures different logging transports based on the application environment.
 * Logs are output to the console and written to file in the 'logs' directory.
 */
export const logger = winston.createLogger({
  level: serverConfig.isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
