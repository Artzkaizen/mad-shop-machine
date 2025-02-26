import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Product } from "@/types/order";

export type Stock = {
  id: number;
  quantity: number;
  product: Product;
  originalQuantity: number;
};
export function getRandomStocks(count: number, stocks: Stock[]): Product[] {
  if (count > stocks.length) {
    throw new Error("Requested product count exceeds available stocks");
  }

  const shuffled = [...stocks].sort(() => 0.5 - Math.random()).slice(0, count);

  return shuffled.map((stock) => {
    const randomQuantity = Math.floor(Math.random() * stock.quantity) + 1;

    return {
      ...stock.product,
      quantity: randomQuantity,
      originalQuantity: stock.quantity,
    };
  });
}

export function distributeProducts(
  stocks: Stock[],
  lockerCount: number
): Stock[][] {
  const distributions: Stock[][] = Array(lockerCount).fill([]);
  const stocksCopy = [...stocks];

  stocksCopy.forEach((stock) => {
    let remainingQuantity = stock.quantity;

    while (remainingQuantity > 0) {
      const lockerIndex = Math.floor(Math.random() * lockerCount);
      const maxQuantity = Math.min(
        remainingQuantity,
        Math.ceil(remainingQuantity / 2)
      );
      const quantityForLocker = Math.max(
        1,
        Math.floor(Math.random() * maxQuantity)
      );

      const stockForLocker: Stock = {
        id: stock.id,
        quantity: quantityForLocker,
        product: stock.product,
        originalQuantity: stock.originalQuantity,
      };

      distributions[lockerIndex] = [
        ...(distributions[lockerIndex] || []),
        stockForLocker,
      ];

      remainingQuantity -= quantityForLocker;
    }
  });

  return distributions;
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}
