import { BaseMiddlewareFunction } from '../context';

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