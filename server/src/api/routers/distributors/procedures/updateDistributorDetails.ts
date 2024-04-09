import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UpdateDistributorDetailsDto, DistributorResponse } from '../dtos';

export const updateDistributorDetails = async (
  input: UpdateDistributorDetailsDto,
  ctx: Context
): Promise<DistributorResponse> => ctx.db.$transaction(async (transaction) => {
    const distributor = await transaction.distributor.findUnique({
      where: { id: input.distributorId, deletedAt: null },
    });

    if (!distributor) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Distributor not found.' });
    }

    const updatedDistributor = await transaction.distributor.update({
      where: { id: input.distributorId },
      data: { paymentTerms: input.paymentTerms },
      include: {
        businesses: true,
        products: true,
      },
    });

    return {
      id: updatedDistributor.id,
      name: updatedDistributor.name,
      paymentTerms: updatedDistributor.paymentTerms,
      businesses: updatedDistributor.businesses.map(({ businessId }) => ({
        id: businessId,
      })),
      products: updatedDistributor.products.map(product => ({
        id: product.id,
      })),
    };
});