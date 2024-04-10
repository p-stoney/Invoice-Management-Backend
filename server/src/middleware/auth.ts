import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { BaseMiddlewareFunction } from '../context';

/**
 * Middleware functions for authentication and access control.
 *
 * - isAuthenticated: Ensures the user is authenticated. Throws UNAUTHORIZED if not.
 * - isAdmin: Ensures the user has admin (ADMIN or SUPERADMIN) rights. Throws FORBIDDEN if not.
 * - isSuperAdmin: Ensures the user has superadmin (SUPERADMIN) rights. Throws FORBIDDEN if not.
 *
 * Each middleware checks for specific user roles before proceeding with the request.
 * If the user does not meet the required role, an appropriate TRPCError is thrown.
 *
 * @param {BaseMiddlewareFunction} ctx - The context of the TRPC request, containing the user and other request details.
 * @param {Function} next - Function to call the next middleware in the stack.
 * @returns {Promise<void>} A promise that resolves when the middleware processing is completed.
 * @throws {TRPCError} - Throws appropriate TRPCError based on the specific check.
 */
export const isAuthenticated: BaseMiddlewareFunction = async ({
  ctx,
  next,
}) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
  }
  return next();
};

export const isAdmin: BaseMiddlewareFunction = async ({ ctx, next }) => {
  if (
    !ctx.user ||
    (ctx.user.role !== Role.ADMIN && ctx.user.role !== Role.SUPERADMIN)
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next();
};

export const isSuperAdmin: BaseMiddlewareFunction = async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== Role.SUPERADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'SuperAdmin access required',
    });
  }
  return next();
};
