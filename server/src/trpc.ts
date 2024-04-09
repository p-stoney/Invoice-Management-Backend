import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { initTRPC } from "@trpc/server";
import SuperJSON from 'superjson';
import { Context } from './context';
import { isAuthenticated, isAdmin, isSuperAdmin, withLogging } from './middleware';

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter: ({ shape, error }) => {
    if (error.cause instanceof ZodError) {
      const validationError = fromZodError(error.cause);
      return {
        ...shape,
        data: {
          message: validationError.message,
        },
      };
    }
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(withLogging);
export const privateProcedure = t.procedure.use(isAuthenticated).use(withLogging);
export const adminProcedure = t.procedure.use(isAdmin).use(withLogging);
export const superAdminProcedure = t.procedure.use(isSuperAdmin).use(withLogging);