import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import {
  CreateProductInput,
  UpdateProductDetailsInput,
  DeleteProductInput,
} from './dtos';
import {
  createProduct,
  updateProductDetails,
  deleteProduct,
} from './procedures';

/**
 * Creates the router for product-related endpoints including creating, updating, and deleting products.
 * Utilizes superAdminProcedure to ensure these operations are only accessible to super admins.
 * Each route validates input against predefined Zod schemas and delegates processing to specific procedures.
 *
 * @module ProductRouter
 */
export const productRouter = createTRPCRouter({
  createProduct: superAdminProcedure
    .input(CreateProductInput)
    .mutation(async ({ input, ctx }) => createProduct(input, ctx)),

  updateProductDetails: superAdminProcedure
    .input(UpdateProductDetailsInput)
    .mutation(async ({ input, ctx }) => updateProductDetails(input, ctx)),

  deleteProduct: superAdminProcedure
    .input(DeleteProductInput)
    .mutation(async ({ input, ctx }) => deleteProduct(input, ctx)),
});
