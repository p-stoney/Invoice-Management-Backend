import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { DeleteBusinessResponse, DeleteBusinessDto } from '../dtos';

export const deleteBusiness = async (
  input: DeleteBusinessDto,
  ctx: Context
): Promise<DeleteBusinessResponse> => ctx.db.$transaction(async (transaction) => {
  const business = await transaction.business.findUnique({
    where: { id: input.businessId, deletedAt: null },
  });

  if (!business) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Business not found.' });
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
