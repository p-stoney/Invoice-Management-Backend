import { publicProcedure, createTRPCRouter } from '../../../trpc';
import { RedeemSetupTokenInput, UserCredentialsInput } from './dtos';
import { signIn, signUp, redeemSetupToken } from './procedures';

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