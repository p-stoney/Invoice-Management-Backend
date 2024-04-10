import { PrismaClient } from '@prisma/client';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import {
  MiddlewareFunction,
  ProcedureParams,
  TRPCError,
  inferAsyncReturnType,
} from '@trpc/server';
import { decodeAndVerifyJwtToken, logger } from './utils';

/**
 * Prisma client instance for database operations.
 * @type {PrismaClient}
 */
export const db = new PrismaClient();

/**
 * Creates the context for a tRPC request. This context includes
 * the request and response objects, the Prisma client, the current
 * user (if authenticated), and a logger.
 *
 * If the request has an authorization header, it attempts to decode
 * and verify the JWT token to authenticate the user. If authentication
 * fails, it throws an UNAUTHORIZED TRPC error.
 *
 * @param {CreateExpressContextOptions} options - The Express request and response objects.
 * @returns {Promise<Context>} The context object including the request, response,
 *          Prisma client, user, and logger.
 * @throws {TRPCError} Throws an UNAUTHORIZED error if JWT verification fails.
 */
export async function createContext({ req, res }: CreateExpressContextOptions) {
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const user = await decodeAndVerifyJwtToken(token);
      return { req, res, db, user, logger };
    } catch (err) {
      throw new TRPCError({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
  }

  return { req, res, db, logger };
}

/**
 * Defines the structure of the context used in TRPC procedures.
 * @typedef {Object} Context
 */
export type Context = inferAsyncReturnType<typeof createContext>;

/**
 * Base middleware function type for procedures.
 * @typedef {MiddlewareFunction<ProcedureParams & {_ctx_out: Context}, ProcedureParams & {_ctx_out: Context}>} BaseMiddlewareFunction
 */
export type BaseMiddlewareFunction = MiddlewareFunction<
  ProcedureParams & { _ctx_out: Context },
  ProcedureParams & { _ctx_out: Context }
>;
