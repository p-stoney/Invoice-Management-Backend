import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { CreateProductDto, ProductResponse } from '../dtos';

/**
 * Creates a new product under a specific distributor. Ensures the distributor exists before product creation.
 *
 * @param {CreateProductDto} input - Contains the name, price, and distributor ID for the new product.
 * @param {Context} ctx - The request context, providing transactional database access.
 * @returns {Promise<ProductResponse>} The details of the newly created product.
 * @throws {TRPCError} with code 'NOT_FOUND' if the specified distributor does not exist.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during product creation.
 */
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
