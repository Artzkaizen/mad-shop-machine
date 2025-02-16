import { INITIAL_MACHINES } from "@/lib/init-machines";
import type { Machine } from "@/types/locker";
import { toast } from "sonner";
import { create } from "zustand";


type MachineState = {
  machines: Record<string, Machine>;
  selectedMachine: string | null;
  selectedLocker: number | null;
  isQrScannerOpen: boolean;
  showQrCodes: boolean;
};

// Add this to your MachineActions type
type MachineActions = {
  setSelectedMachine: (machineId: string | null) => void;
  setSelectedLocker: (lockerId: number | null) => void;
  toggleLockerState: (lockerId: number) => void;
  toggleQrScanner: (isOpen: boolean) => void;
  toggleQrCodes: () => void;
  handleQrScan: (result: string) => void;
  updateProductQuantity: (productId: number, increment: boolean) => void;
  resetMachines: () => void;
};


const initialState: MachineState = {
  machines: INITIAL_MACHINES,
  selectedMachine: null,
  selectedLocker: null,
  isQrScannerOpen: false,
  showQrCodes: false,
};

export const useMachineStore = create<MachineState & MachineActions>()((set, get) => ({
  ...initialState,

  resetMachines: () => {
    set(() => ({
      ...initialState,
      machines: INITIAL_MACHINES
    }));
  },
  setSelectedMachine: (machineId) => set({ selectedMachine: machineId }),

  setSelectedLocker: (lockerId) => set({ selectedLocker: lockerId }),

  toggleLockerState: (lockerId) => {
    const { selectedMachine, machines } = get();
    if (!selectedMachine) return;

    set({
      machines: {
        ...machines,
        [selectedMachine]: {
          ...machines[selectedMachine],
          lockers: machines[selectedMachine].lockers.map((locker) =>
            locker.id === lockerId
              ? { ...locker, isOpen: !locker.isOpen }
              : locker
          ),
        },
      },
      selectedLocker: lockerId,
    });
  },

  toggleQrScanner: (isOpen) => set({ isQrScannerOpen: isOpen }),

  toggleQrCodes: () => set((state) => ({ showQrCodes: !state.showQrCodes })),

  handleQrScan: (result) => {
    const { machines } = get();
    const matchedMachine = Object.values(machines).find(
      (machine) => machine.qrCode === result
    );

    if (matchedMachine && matchedMachine.available) {
      const updatedMachines = Object.entries(machines).reduce((acc, [id, machine]) => ({
        ...acc,
        [id]: {
          ...machine,
          available: id === matchedMachine.id
        }
      }), {});

      set({ 
        selectedMachine: matchedMachine.id, 
        isQrScannerOpen: false,
        machines: updatedMachines
      });
      
      toast.success("Machine opened!", {
        description: "Pick your items from the locker",
      });
    } else {
      toast.error("Invalid or Unavailable Machine");
    }
  },

  updateProductQuantity: (productId, increment) => {
    const { selectedMachine, selectedLocker, machines } = get();
    if (!selectedMachine || !selectedLocker) return;

    set({
      machines: {
        ...machines,
        [selectedMachine]: {
          ...machines[selectedMachine],
          lockers: machines[selectedMachine].lockers.map((locker) =>
            locker.id === selectedLocker
              ? {
                  ...locker,
                  products: locker.products.map((product) =>
                    product.id === productId
                      ? {
                          ...product,
                          quantity: increment
                            ? Math.min(
                                (product.quantity || 0) + 1,
                                product.originalQuantity || 0
                              )
                            : Math.max((product.quantity || 0) - 1, 0),
                        }
                      : product
                  ),
                }
              : locker
          ),
        },
      },
    });
  },
}));