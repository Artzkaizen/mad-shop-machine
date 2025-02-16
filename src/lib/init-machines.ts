import { Machine } from "@/types/locker";
import { getRandomProducts } from "./utils";

export const INITIAL_MACHINES: Record<string, Machine> = {
    machine1: {
      id: "machine1",
      name: "Machine 1",
      available: true,
      qrCode: "locker-machine1",
      lockers: new Array(16).fill(null).map((_, i) => ({
        id: i + 1,
        isOpen: true,
        isOccupied: false,
        products: getRandomProducts(Math.floor(Math.random() * 5) + 1),
      })),
    },
    machine2: {
      id: "machine2",
      name: "Machine 2", 
      available: true,
      qrCode: "locker-machine2",
      lockers: Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        isOpen: false,
        isOccupied: false,
        products: getRandomProducts(Math.floor(Math.random() * 5) + 1)
      })),
    },
    machine3: {
      id: "machine3",
      name: "Machine 3",
      available: false,
      qrCode: "locker-machine3", 
      lockers: Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        isOpen: false,
        isOccupied: false,
        products: getRandomProducts(Math.floor(Math.random() * 5) + 1)
      })),
    },
  };