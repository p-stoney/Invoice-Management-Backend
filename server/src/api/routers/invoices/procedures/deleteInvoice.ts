import { TRPCError } from '@trpc/server';
import { Context } from '@server/context';
import { DeleteInvoiceDto, DeleteInvoiceResponse } from '../dtos';

/**
 * Soft-deletes an invoice by marking it as deleted in the database. Checks for the existence of the invoice before deletion.
 *
 * @param {DeleteInvoiceDto} input - Contains the ID of the invoice to be deleted.
 * @param {Context} ctx - The request context, encapsulating the transactional database access.
 * @returns {Promise<DeleteInvoiceResponse>} A message confirming the successful deletion of the invoice.
 * @throws {TRPCError} with code 'NOT_FOUND' if the specified invoice does not exist.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during deletion.
 */
export const deleteInvoice = async (
  input: DeleteInvoiceDto,
  ctx: Context
): Promise<DeleteInvoiceResponse> => {
  const invoice = await ctx.db.invoice.findUnique({
    where: { id: input.invoiceId, deletedAt: null },
  });

  if (!invoice) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found.' });
  }

  await ctx.db.invoice.update({
    where: { id: input.invoiceId },
    data: { deletedAt: new Date() },
  });

  return {
    message: `Invoice ${input.invoiceId} has been soft-deleted successfully.`,
    invoiceId: input.invoiceId,
  };
};
