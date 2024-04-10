import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { DeleteBusinessResponse, DeleteBusinessDto } from '../dtos';

/**
 * Soft-deletes a business by marking it as deleted in the database without actually removing its record.
 * This allows for potential recovery and auditability. The operation ensures that the business exists and has not
 * already been deleted.
 *
 * @param {DeleteBusinessDto} input - DTO containing the ID of the business to be deleted.
 * @param {Context} ctx - The request context with access to the database instance for transaction handling.
 * @returns {Promise<DeleteBusinessResponse>} A promise that resolves with a success message upon successful deletion.
 * @throws {TRPCError} with code 'NOT_FOUND' if the specified business does not exist or is already deleted.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the deletion process.
 */
export const deleteBusiness = async (
  input: DeleteBusinessDto,
  ctx: Context
): Promise<DeleteBusinessResponse> =>
  ctx.db.$transaction(async (transaction) => {
    const business = await transaction.business.findUnique({
      where: { id: input.businessId, deletedAt: null },
    });

    if (!business) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Business not found.',
      });
    }

    await transaction.business.update({
      where: { id: input.businessId },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Business ${input.businessId} has been soft-deleted successfully.`,
      businessId: input.businessId,
    };
  });
