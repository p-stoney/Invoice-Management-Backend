import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { CreateDistributorDto, DistributorResponse } from '../dtos';

/**
 * Creates a new distributor with the specified details. Ensures that the distributor's name is unique.
 *
 * @param {CreateDistributorDto} input - The input data for creating the distributor, including name and payment terms.
 * @param {Context} ctx - The request context, containing database access and the authenticated user.
 * @returns {Promise<DistributorResponse>} The details of the newly created distributor.
 * @throws {TRPCError} with code 'CONFLICT' if a distributor with the same name already exists.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during creation.
 */
export const createDistributor = async (
  input: CreateDistributorDto,
  ctx: Context
): Promise<DistributorResponse> => {
  try {
    const distributor = await ctx.db.distributor.create({
      data: {
        ...input,
      },
    });

    return {
      id: distributor.id,
      name: distributor.name,
      paymentTerms: distributor.paymentTerms,
      businesses: [],
      products: [],
      invoices: [],
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A distributor with this name already exists.',
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create the distributor.',
    });
  }
};
