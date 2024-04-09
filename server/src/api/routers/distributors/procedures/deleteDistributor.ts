import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { DeleteDistributorResponse, DeleteDistributorDto } from '../dtos';

export const deleteDistributor = async (
  input: DeleteDistributorDto,
  ctx: Context
): Promise<DeleteDistributorResponse> => ctx.db.$transaction(async (transaction) => {
    const distributor = await transaction.distributor.findUnique({
      where: { id: input.distributorId, deletedAt: null },
    });

    if (!distributor) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Distributor not found.' });
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