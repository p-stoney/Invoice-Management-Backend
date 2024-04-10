import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import {
  CreateBusinessInput,
  UpdateBusinessDistributorsInput,
  DeleteBusinessInput,
} from './dtos';
import {
  createBusiness,
  updateBusinessDetails,
  deleteBusiness,
} from './procedures';

/**
 * Creates the router for business-related endpoints including creating, updating, and deleting businesses.
 * Utilizes superAdminProcedure to ensure these operations are only accessible to super admins.
 * Each route validates input against predefined Zod schemas and delegates processing to specific procedures.
 *
 * @module BusinessRouter
 */
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
