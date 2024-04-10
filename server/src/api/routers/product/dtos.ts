import { z } from 'zod';

/**
 * Defines data transfer objects (DTOs) and validation schemas for product-related operations.
 * These DTOs are used for creating products, updating product details, and deleting products,
 * ensuring that input data adheres to expected formats and constraints.
 *
 * @module ProductDTOs
 */
export const ProductResponseSchema = z.object({
  id: z.number(),
  distributorId: z.number(),
  name: z.string(),
  price: z.string(),
});

export const DeleteProductResponseSchema = z.object({
  message: z.string(),
  productId: z.number(),
});

export type ProductResponse = z.TypeOf<typeof ProductResponseSchema>;
export type DeleteProductResponse = z.TypeOf<
  typeof DeleteProductResponseSchema
>;

export const CreateProductInput = z.object({
  distributorId: z.number(),
  name: z.string(),
  price: z.string(),
});

export const UpdateProductDetailsInput = z.object({
  productId: z.number(),
  price: z.string(),
});

export const DeleteProductInput = z.object({
  productId: z.number(),
});

export type CreateProductDto = z.TypeOf<typeof CreateProductInput>;
export type UpdateProductDetailsDto = z.TypeOf<
  typeof UpdateProductDetailsInput
>;
export type DeleteProductDto = z.TypeOf<typeof DeleteProductInput>;
