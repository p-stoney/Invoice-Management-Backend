import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { DeleteProductResponse, DeleteProductDto } from '../dtos';

/**
 * Soft-deletes a product by marking it as deleted in the database. Checks for the existence of the product before deletion.
 *
 * @param {DeleteProductDto} input - Contains the ID of the product to be deleted.
 * @param {Context} ctx - The request context, encapsulating the transactional database access.
 * @returns {Promise<DeleteProductResponse>} A message confirming the successful deletion of the product.
 * @throws {TRPCError} with code 'NOT_FOUND' if the specified product does not exist.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during deletion.
 */
export const deleteProduct = async (
  input: DeleteProductDto,
  ctx: Context
): Promise<DeleteProductResponse> =>
  ctx.db.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: { id: input.productId, deletedAt: null },
    });

    if (!product) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found.' });
    }

    await transaction.product.update({
      where: { id: input.productId },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Product ${input.productId} has been soft-deleted successfully.`,
      productId: input.productId,
    };
  });
