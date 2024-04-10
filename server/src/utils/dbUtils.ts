import { Context } from '../context';

/**
 * Fetches prices for a list of product IDs.
 * Returns a map of product IDs to their prices, facilitating quick access to product prices by ID.
 *
 * @param {number[]} productIds - An array of product IDs for which prices are fetched.
 * @param {Context} ctx - The context including the Prisma client for database access.
 * @returns {Promise<Map<number, string>>} - A map of product IDs to their respective prices as strings.
 */
export async function fetchProductPrices(
  productIds: number[],
  ctx: Context
): Promise<Map<number, string>> {
  const products = await ctx.db.product.findMany({
    where: {
      id: { in: productIds },
    },
  });
  return new Map(
    products.map((product) => [product.id, product.price.toString()])
  );
}
