import { PrismaClient } from '@prisma/client';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { MiddlewareFunction, ProcedureParams, TRPCError, inferAsyncReturnType } from "@trpc/server";
import { decodeAndVerifyJwtToken, logger } from './utils';

export const db = new PrismaClient();

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

export type Context = inferAsyncReturnType<typeof createContext>;

export type BaseMiddlewareFunction = MiddlewareFunction<
  ProcedureParams & { _ctx_out: Context },
  ProcedureParams & { _ctx_out: Context }
>;