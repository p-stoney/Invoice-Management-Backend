import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import {
  CreateDistributorInput,
  UpdateDistributorDetailsInput,
  DeleteDistributorInput,
} from './dtos';
import {
  createDistributor,
  updateDistributorDetails,
  deleteDistributor,
} from './procedures';

/**
 * Creates the router for distributor-related endpoints including creating, updating, and deleting distributors.
 * Utilizes superAdminProcedure to ensure these operations are only accessible to super admins.
 * Each route validates input against predefined Zod schemas and delegates processing to specific procedures.
 *
 * @module DistributorRouter
 */
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
