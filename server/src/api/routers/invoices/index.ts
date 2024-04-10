import {
  superAdminProcedure,
  adminProcedure,
  createTRPCRouter,
} from '../../../trpc';
import {
  CreateInvoiceInput,
  UpdateInvoiceStatusInput,
  DeleteInvoiceInput,
} from './dtos';
import {
  createInvoice,
  markInvoiceAsPaid,
  markInvoiceAsUnpaid,
  deleteInvoice,
} from './procedures';

/**
 * Creates the router for invoice-related endpoints including creating, updating, and deleting invoices.
 * Utilizes superAdminProcedure to ensure these operations are only accessible to super admins.
 * Each route validates input against predefined Zod schemas and delegates processing to specific procedures.
 *
 * @module InvoiceRouter
 */
export const invoiceRouter = createTRPCRouter({
  createInvoice: superAdminProcedure
    .input(CreateInvoiceInput)
    .mutation(async ({ input, ctx }) => createInvoice(input, ctx)),

  markInvoiceAsPaid: adminProcedure
    .input(UpdateInvoiceStatusInput)
    .mutation(async ({ input, ctx }) => markInvoiceAsPaid(input, ctx)),

  markInvoiceAsUnpaid: adminProcedure
    .input(UpdateInvoiceStatusInput)
    .mutation(async ({ input, ctx }) => markInvoiceAsUnpaid(input, ctx)),

  deleteInvoice: superAdminProcedure
    .input(DeleteInvoiceInput)
    .mutation(async ({ input, ctx }) => deleteInvoice(input, ctx)),
});
