import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { BaseMiddlewareFunction } from '../context';

export const isAuthenticated: BaseMiddlewareFunction = async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
  }
  return next();
};

export const isAdmin: BaseMiddlewareFunction = async ({ ctx, next }) => {
  if (!ctx.user || (ctx.user.role !== Role.ADMIN && ctx.user.role !== Role.SUPERADMIN)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next();
};

export const isSuperAdmin: BaseMiddlewareFunction = async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== Role.SUPERADMIN) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'SuperAdmin access required' });
  }
  return next();
};