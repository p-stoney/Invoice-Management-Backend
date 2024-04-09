import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import { CreateDistributorInput, UpdateDistributorDetailsInput, DeleteDistributorInput } from './dtos';
import { createDistributor, updateDistributorDetails, deleteDistributor } from './procedures';

export const distributorRouter = createTRPCRouter({
  createDistributor: superAdminProcedure
    .input(CreateDistributorInput)
    .mutation(async ({ input, ctx }) => createDistributor(input, ctx)),

  updateDistributorDetails: superAdminProcedure
    .input(UpdateDistributorDetailsInput)
    .mutation(async ({ input, ctx }) => updateDistributorDetails(input, ctx)),

  deleteDistributor: superAdminProcedure
    .input(DeleteDistributorInput)
    .mutation(async ({ input, ctx }) => deleteDistributor(input, ctx)),
});