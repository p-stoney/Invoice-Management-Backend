import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UpdateDistributorDetailsDto, DistributorResponse } from '../dtos';

/**
 * Updates the payment terms of an existing distributor. Checks for the distributor's existence
 * and ensures it has not been deleted before applying updates.
 *
 * @param {UpdateDistributorDetailsDto} input - The distributor ID and new payment terms to be applied.
 * @param {Context} ctx - The request context, providing access to transactional database operations.
 * @returns {Promise<DistributorResponse>} The updated distributor details, including associated businesses and products.
 * @throws {TRPCError} with code 'NOT_FOUND' if the distributor cannot be found or has been deleted.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the update.
 */
export const updateDistributorDetails = async (
  input: UpdateDistributorDetailsDto,
  ctx: Context
): Promise<DistributorResponse> =>
  ctx.db.$transaction(async (transaction) => {
    const distributor = await transaction.distributor.findUnique({
      where: { id: input.distributorId, deletedAt: null },
    });

    if (!distributor) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Distributor not found.',
      });
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
      products: updatedDistributor.products.map((product) => ({
        id: product.id,
      })),
    };
  });
