import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UpdateBusinessDistributorsDto, BusinessResponse } from '../dtos';

export const updateBusinessDetails = async (
  input: UpdateBusinessDistributorsDto,
  ctx: Context
): Promise<BusinessResponse> => {
  const { businessId, distributorIds } = input;

  return ctx.db.$transaction(async (transaction) => {
    const business = await transaction.business.findUnique({
      where: { id: businessId, deletedAt: null },
    });

    if (!business) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Business not found.' });
    }

    await Promise.all(distributorIds.map(distributorId =>
      transaction.businessDistributor.create({
        data: {
          businessId,
          distributorId,
        },
      })
    ));

    const updatedBusiness = await transaction.business.findUnique({
      where: { id: businessId },
      include: {
        distributors: {
          include: {
            distributor: true,
          },
        },
      },
    });

    if (!updatedBusiness) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update business information.' });
    }

    return {
      id: updatedBusiness.id,
      name: updatedBusiness.name,
      distributors: updatedBusiness.distributors.map(({ distributor }) => ({
        id: distributor.id,
        name: distributor.name,
      })),
    };
  });
};