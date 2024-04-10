import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import {
  UserOperationInput,
  UserAssociationInput,
  UpdateUserAssociationsInput,
} from './dtos';
import {
  promoteUser,
  demoteUser,
  associateUserWithBusiness,
  updateUserBusinessAssociations,
  removeUserBusinessAssociations,
} from './procedures';

/**
 * Creates the router for user-related endpoints including promoting, demoting, and associating users with businesses.
 * Utilizes superAdminProcedure to ensure these operations are only accessible to super admins.
 * Each route validates input against predefined Zod schemas and delegates processing to specific procedures.
 *
 * @module UserRouter
 */
export const userRouter = createTRPCRouter({
  promoteUser: superAdminProcedure
    .input(UserOperationInput)
    .mutation(async ({ input, ctx }) => promoteUser(input, ctx)),

  demoteUser: superAdminProcedure
    .input(UserOperationInput)
    .mutation(async ({ input, ctx }) => demoteUser(input, ctx)),

  associateUserWithBusiness: superAdminProcedure
    .input(UserAssociationInput)
    .mutation(async ({ input, ctx }) => associateUserWithBusiness(input, ctx)),

  updateUserBusinessAssociations: superAdminProcedure
    .input(UpdateUserAssociationsInput)
    .mutation(async ({ input, ctx }) =>
      updateUserBusinessAssociations(input, ctx)
    ),

  removeUserBusinessAssociations: superAdminProcedure
    .input(UserAssociationInput)
    .mutation(async ({ input, ctx }) =>
      removeUserBusinessAssociations(input, ctx)
    ),
});
