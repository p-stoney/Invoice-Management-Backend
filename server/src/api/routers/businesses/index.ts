import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import { CreateBusinessInput, UpdateBusinessDistributorsInput, DeleteBusinessInput } from './dtos';
import { createBusiness, updateBusinessDetails, deleteBusiness } from './procedures';

export const businessRouter = createTRPCRouter({
  createBusiness: superAdminProcedure
    .input(CreateBusinessInput)
    .mutation(async ({ input, ctx }) => createBusiness(input, ctx)),

  updateBusinessDetails: superAdminProcedure
    .input(UpdateBusinessDistributorsInput)
    .mutation(async ({ input, ctx }) => updateBusinessDetails(input, ctx)),

  deleteBusiness: superAdminProcedure
    .input(DeleteBusinessInput)
    .mutation(async ({ input, ctx }) => deleteBusiness(input, ctx)),
});