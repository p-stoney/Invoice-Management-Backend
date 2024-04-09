import { TRPCError } from '@trpc/server';
import { Context } from '@server/context';
import { DeleteInvoiceDto, DeleteInvoiceResponse } from '../dtos';

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