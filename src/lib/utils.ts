import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import products from "@/lib/products.json";
import { Product } from "@/types/order";

export function getRandomProducts(count: number): Product[] {
  if (count > products.length) {
    throw new Error("Requested product count exceeds available products");
  }
  const shuffled = products.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    originalQuantity: product.quantity,
    documentId: crypto.randomUUID(),
    description: product.name,
    createdAt: Date.now().toLocaleString(),
    updatedAt: Date.now().toLocaleString(),
    imageUrl: "product.imageUrl",
    category: "product.category",
    publishedAt: Date.now().toLocaleString(),
    productStatus: "ACTIVE",
  }));
}
