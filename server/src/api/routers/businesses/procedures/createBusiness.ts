import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { CreateBusinessDto, BusinessResponse } from '../dtos';

export const createBusiness = async (
  input: CreateBusinessDto,
  ctx: Context
): Promise<BusinessResponse> => {
  try {
    const business = await ctx.db.business.create({
      data: {
        name: input.name,
        userId: ctx.user!.id,
      },
    });

    return {
      id: business.id,
      name: business.name,
      distributors: [],
      invoices: [],
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new TRPCError({ code: 'CONFLICT', message: 'A business with this name already exists.' });
    }
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create the business.' });
  }
};