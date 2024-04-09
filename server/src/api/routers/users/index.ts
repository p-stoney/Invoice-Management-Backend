import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import { UserOperationInput, UserAssociationInput, UpdateUserAssociationsInput } from './dtos';
import { promoteUser, demoteUser, associateUserWithBusiness, updateUserBusinessAssociations, removeUserBusinessAssociations } from './procedures';

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
    .mutation(async ({ input, ctx }) => updateUserBusinessAssociations(input, ctx)),

  removeUserBusinessAssociations: superAdminProcedure
    .input(UserAssociationInput)
    .mutation(async ({ input, ctx }) => removeUserBusinessAssociations(input, ctx)),
});