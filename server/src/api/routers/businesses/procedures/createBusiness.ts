import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '../../../../context';
import { CreateBusinessDto, BusinessResponse } from '../dtos';

/**
 * Creates a new business with the provided name. This procedure ensures that each business
 * has a unique name and associates it with the currently authenticated user as the owner.
 *
 * @param {CreateBusinessDto} input - DTO containing the name of the business to be created.
 * @param {Context} ctx - The request context, containing the authenticated user and database instance.
 * @returns {Promise<BusinessResponse>} A promise that resolves with the details of the newly created business.
 * @throws {TRPCError} with code 'CONFLICT' if a business with the provided name already exists.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the creation process.
 */
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A business with this name already exists.',
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create the business.',
    });
  }
};
