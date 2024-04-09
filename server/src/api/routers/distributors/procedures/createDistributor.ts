import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { CreateDistributorDto, DistributorResponse } from '../dtos';

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new TRPCError({ code: 'CONFLICT', message: 'A distributor with this name already exists.' });
    }
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create the distributor.' });
  }
};