import { BaseMiddlewareFunction } from '../context';

/**
 * Middleware to log the execution duration of procedures.
 * Logs the time taken for a procedure to execute successfully, and logs any errors encountered during execution.
 *
 * @param {BaseMiddlewareFunction} ctx - The context of the request, including the logger.
 * @param {Function} next - Function to proceed to the next middleware or procedure.
 * @returns {Promise<any>} - The result of the procedure call.
 */
export const withLogging: BaseMiddlewareFunction = async ({ ctx, next }) => {
  const start = Date.now();
  try {
    const result = await next();
    const duration = Date.now() - start;
    ctx.logger.info(`Procedure executed in ${duration}ms`);
    return result;
  } catch (error) {
    ctx.logger.error('Procedure error:', error);
    throw error;
  }
};
