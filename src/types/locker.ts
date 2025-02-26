import { Stock } from "@/lib/utils";

export interface Machine {
  id: string;
  name: string;
  available: boolean;
  isOccupied: boolean;
  qrCode: string;
  lockers: Locker[];
  stocks: Stock[];
  documentId: string;
  image: string | null;

  machineStatus: "ACTIVE" | "TEMPORARILY_INACTIVE" | "PERMANENTLY";
}

export interface Locker {
  id: number;
  isOpen: boolean;
  isOccupied: boolean;
  stocks: Stock[];
}

export interface SmartLockerGridProps {
  machines: Record<string, Machine>;
  onMachineSelect: (machineId: string | null) => void;
  selectedMachine: string | null;
}

export interface LockerGridProps {
  machine: Machine;
  onLockerToggle: (lockerId: number) => void;
}

export interface LockerProps {
  id: number;
  isOpen: boolean;
  isOccupied: boolean;
  onToggle: () => void;
}
