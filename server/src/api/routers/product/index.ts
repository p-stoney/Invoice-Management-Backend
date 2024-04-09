import { superAdminProcedure, createTRPCRouter } from '../../../trpc';
import { CreateProductInput, UpdateProductDetailsInput, DeleteProductInput } from './dtos';
import { createProduct, updateProductDetails, deleteProduct } from './procedures';

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