import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';
import { Context } from './context';
import {
  isAuthenticated,
  isAdmin,
  isSuperAdmin,
  withLogging,
} from './middleware';

/**
 * Initializes the tRPC server configuration.
 * It sets up SuperJSON as the transformer for serializing and deserializing complex types like Dates.
 * It also configures custom error formatting to handle Zod validation errors.
 *
 * @type {import("@trpc/server").TRPCRouterConstructorOptions<Context>}
 */
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

/**
 * Helper functions to create tRPC routers with predefined middlewares.
 * - `createTRPCRouter` is the base function to create new routers.
 * - `publicProcedure` applies logging middleware to public procedures.
 * - `privateProcedure` applies authentication and logging middleware to private procedures.
 * - `adminProcedure` ensures the user is an admin or superadmin, with logging.
 * - `superAdminProcedure` ensures the user is a superadmin, with logging.
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(withLogging);
export const privateProcedure = t.procedure
  .use(isAuthenticated)
  .use(withLogging);
export const adminProcedure = t.procedure.use(isAdmin).use(withLogging);
export const superAdminProcedure = t.procedure
  .use(isSuperAdmin)
  .use(withLogging);
