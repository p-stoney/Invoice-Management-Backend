import { createTRPCRouter } from '../trpc';
import { authRouter } from './routers/auth';
import { businessRouter } from './routers/businesses';
import { distributorRouter } from './routers/distributors';
import { invoiceRouter } from './routers/invoices';
import { productRouter } from './routers/product';
import { userRouter } from './routers/users';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  business: businessRouter,
  distributor: distributorRouter,
  invoice: invoiceRouter,
  product: productRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;