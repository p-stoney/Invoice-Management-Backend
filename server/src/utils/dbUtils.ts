import { Context } from '../context';

export async function fetchProductPrices(productIds: number[], ctx: Context): Promise<Map<number, string>> {
  const products = await ctx.db.product.findMany({
    where: {
      id: { in: productIds },
    },
  });
  return new Map(products.map(product => [product.id, product.price.toString()]));
}