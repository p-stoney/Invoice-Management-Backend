import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { UpdateProductDetailsDto, ProductResponse } from '../dtos';

export const updateProductDetails = async (
  input: UpdateProductDetailsDto,
  ctx: Context
): Promise<ProductResponse> => ctx.db.$transaction(async (transaction) => {
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