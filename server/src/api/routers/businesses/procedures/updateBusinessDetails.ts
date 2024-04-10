import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UpdateBusinessDistributorsDto, BusinessResponse } from '../dtos';

/**
 * Updates the details of an existing business. This procedure allows for updating the list of distributors
 * associated with the business. It checks if the business exists and ensures that all specified distributors exist
 * before making the association.
 *
 * @param {UpdateBusinessDistributorsDto} input - DTO containing the business ID and distributor IDs for association.
 * @param {Context} ctx - The request context, encapsulating the transactional database access and the authenticated user.
 * @returns {Promise<BusinessResponse>} A promise that resolves with the updated details of the business, including
 * the updated list of distributors.
 * @throws {TRPCError} with code 'NOT_FOUND' if the business does not exist or any of the specified distributors do not exist.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the update process.
 */
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
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Business not found.',
      });
    }

    await Promise.all(
      distributorIds.map((distributorId) =>
        transaction.businessDistributor.create({
          data: {
            businessId,
            distributorId,
          },
        })
      )
    );

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
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update business information.',
      });
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
