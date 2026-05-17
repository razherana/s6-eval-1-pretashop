/**
 * Shared cache for combination price_ttc values (including base products).
 * Key format: "${productId}_${combinationId}" — combinationId is 0 for base products.
 * Populated by variant import, consumed by customer import
 * to avoid redundant API calls.
 */
export const combinationPriceMap = new Map<string, number>();

function buildKey(productId: number, combinationId: number): string {
  return `${productId}_${combinationId}`;
}

export function getCombinationPrice(productId: number, combinationId: number): number | undefined {
  return combinationPriceMap.get(buildKey(productId, combinationId));
}

export function setCombinationPrice(productId: number, combinationId: number, priceTtc: number): void {
  combinationPriceMap.set(buildKey(productId, combinationId), priceTtc);
}

export function hasCombinationPrice(productId: number, combinationId: number): boolean {
  return combinationPriceMap.has(buildKey(productId, combinationId));
}

export function clearCombinationPriceCache(): void {
  combinationPriceMap.clear();
}
