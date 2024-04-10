import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { DeleteDistributorResponse, DeleteDistributorDto } from '../dtos';

/**
 * Soft-deletes a distributor by marking it as deleted in the database, preserving its data for auditability.
 * Checks for the existence of the distributor before attempting deletion.
 *
 * @param {DeleteDistributorDto} input - Contains the ID of the distributor to be deleted.
 * @param {Context} ctx - The request context, encapsulating the transactional database access.
 * @returns {Promise<DeleteDistributorResponse>} A message confirming the successful deletion of the distributor.
 * @throws {TRPCError} with code 'NOT_FOUND' if the specified distributor does not exist.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during deletion.
 */
export const deleteDistributor = async (
  input: DeleteDistributorDto,
  ctx: Context
): Promise<DeleteDistributorResponse> =>
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

    await transaction.distributor.update({
      where: { id: input.distributorId },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Distributor ${input.distributorId} has been soft-deleted successfully.`,
      distributorId: input.distributorId,
    };
  });
