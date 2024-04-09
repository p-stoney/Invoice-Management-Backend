import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { DeleteProductResponse, DeleteProductDto } from '../dtos';

export const deleteProduct = async (
  input: DeleteProductDto,
  ctx: Context
): Promise<DeleteProductResponse> => ctx.db.$transaction(async (transaction) => {
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