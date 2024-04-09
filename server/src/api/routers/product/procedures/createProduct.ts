import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { CreateProductDto, ProductResponse } from '../dtos';

export const createProduct = async (
  input: CreateProductDto,
  ctx: Context
): Promise<ProductResponse> => {
    const { distributorId, name, price } = input;

    const distributorExists = await ctx.db.distributor.findUnique({
      where: { id: distributorId },
    });

    if (!distributorExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Distributor not found.`,
      });
    }

    const product = await ctx.db.product.create({
      data: {
        distributorId,
        name,
        price: new Prisma.Decimal(price),
      },
    });

    return {
      id: product.id,
      distributorId: product.distributorId,
      name: product.name,
      price: product.price.toString(),
    };
};