import { Product } from "./order";

export interface Machine {
	id: string;
	name: string;
	available: boolean;
	qrCode: string;
	lockers: Locker[];
}

export interface Locker {
	id: number;
	isOpen: boolean;
	isOccupied: boolean;
	products: Product[];
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
