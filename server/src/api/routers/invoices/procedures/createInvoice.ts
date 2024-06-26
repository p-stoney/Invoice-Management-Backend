import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { fetchProductPrices } from '@server/utils/dbUtils';
import { Context } from '../../../../context';
import { InvoiceResponse, CreateInvoiceDto } from '../dtos';

/**
 * Creates a new invoice with specified details including distributor, business, and items.
 * Ensures the distributor exists and calculates due date based on distributor's payment terms.
 * Validates that prices for all items are available before creating the invoice.
 *
 * @param {CreateInvoiceDto} input - The input data for creating the invoice.
 * @param {Context} ctx - The request context, containing database access and the authenticated user.
 * @returns {Promise<InvoiceResponse>} The details of the newly created invoice including items with prices.
 * @throws {TRPCError} with code 'NOT_FOUND' for non-existent distributor or missing product prices.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during invoice creation.
 */
export const createInvoice = async (
  input: CreateInvoiceDto,
  ctx: Context
): Promise<InvoiceResponse> => {
  const { businessId, distributorId, items } = input;

  const distributorExists = await ctx.db.distributor.findUnique({
    where: { id: distributorId },
  });

  if (!distributorExists) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Distributor with ID ${distributorId} not found.`,
    });
  }

  const dueBy = new Date();
  dueBy.setDate(dueBy.getDate() + distributorExists.paymentTerms);

  const productPrices = await fetchProductPrices(
    items.map((item) => item.productId),
    ctx
  );

  const missingPrice = items.some((item) => !productPrices.has(item.productId));
  if (missingPrice) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Price for one or more products not found.',
    });
  }

  const invoiceItems = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: productPrices.get(item.productId),
  }));

  const invoice = await ctx.db.invoice.create({
    data: {
      businessId,
      distributorId,
      dueBy,
      status: 'UNPAID',
      items: {
        create: invoiceItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: new Prisma.Decimal(item.price!),
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return {
    id: invoice.id,
    businessId: invoice.businessId,
    distributorId: invoice.distributorId,
    status: invoice.status,
    dueBy: invoice.dueBy,
    items: invoice.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price.toString(),
    })),
  };
};
