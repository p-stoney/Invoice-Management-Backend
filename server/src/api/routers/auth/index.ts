import { publicProcedure, createTRPCRouter } from '../../../trpc';
import { RedeemSetupTokenInput, UserCredentialsInput } from './dtos';
import { signIn, signUp, redeemSetupToken } from './procedures';

/**
 * Creates the router for authentication-related endpoints including sign-up, sign-in, and redeeming setup tokens.
 * Utilizes publicProcedure to ensure these operations are accessible without authentication.
 * Each route validates input against predefined Zod schemas and delegates processing to specific procedures.
 *
 * @module AuthRouter
 */
export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(UserCredentialsInput)
    .mutation(async ({ input, ctx }) => signUp(input, ctx)),

  signIn: publicProcedure
    .input(UserCredentialsInput)
    .mutation(async ({ input, ctx }) => signIn(input, ctx)),

  redeemSetupToken: publicProcedure
    .input(RedeemSetupTokenInput)
    .mutation(async ({ input, ctx }) => redeemSetupToken(input, ctx)),
});
