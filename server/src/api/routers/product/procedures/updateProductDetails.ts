import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { UpdateProductDetailsDto, ProductResponse } from '../dtos';

/**
 * Updates the details of an existing product, specifically its price. Ensures the product exists before performing the update.
 *
 * @param {UpdateProductDetailsDto} input - Contains the product ID and the new price to be set.
 * @param {Context} ctx - The request context, providing transactional database access for updates.
 * @returns {Promise<ProductResponse>} The updated product details including the new price.
 * @throws {TRPCError} with code 'NOT_FOUND' if the product cannot be found or has been previously deleted.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the update process.
 */
export const updateProductDetails = async (
  input: UpdateProductDetailsDto,
  ctx: Context
): Promise<ProductResponse> =>
  ctx.db.$transaction(async (transaction) => {
    const existingProduct = await transaction.product.findUnique({
      where: { id: input.productId, deletedAt: null },
    });

    if (!existingProduct) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found.' });
    }

    const updatedProduct = await transaction.product.update({
      where: { id: input.productId },
      data: { price: new Prisma.Decimal(input.price) },
    });

    return {
      id: updatedProduct.id,
      distributorId: updatedProduct.distributorId,
      name: updatedProduct.name,
      price: updatedProduct.price.toString(),
    };
  });
