import { Machine } from "@/types/locker";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { createStore, StoreApi, useStore } from "zustand";


export type MachineState = {
  onGoingTranx: boolean;
  machines: Machine[];
  selectedMachine: Machine | null;
  selectedLocker: number | null;
  isQrScannerOpen: boolean;
  showQrCodes: boolean;
  showLockers: boolean;
};

type MachineActions = {
  setSelectedMachine: (machine: Machine | null) => void;
  setSelectedLocker: (lockerId: number | null) => void;
  openLocker: (lockerId: number) => void;
  toggleQrScanner: (isOpen: boolean) => void;
  toggleQrCodes: () => void;
  handleQrScan: (result: string, productIds:string[]) => void;
  updateProductQuantity: (productId: string, increment: boolean) => void;
  resetMachines: () => void;
  closeAllLockers: () => void;
  setShowLockers: (show: boolean) => void;
  checkAllDoorsClosed: () => boolean;
};

export type MachineStore = MachineState & MachineActions;

const MachineContext = createContext<StoreApi<MachineStore> | undefined>(undefined)
interface MachineProviderProps {
    children: React.ReactNode;
    initialState: MachineState;
    machines: Machine[];
}


export function useMachineContext<T>(selector: (state: MachineStore) => T) {
    const context = useContext(MachineContext);
    if (!context) {
        throw new Error("useMachineStore must be used within a MachineProvider");
    }
    return useStore(context, selector);
}

export const MachineProvider = (props: MachineProviderProps) => {
    const [store] = useState(() => 
        createStore<MachineStore>()((set, get) => ({
            ...props.initialState,
          
            resetMachines: () => {
              set(() => ({
                ...props.initialState,
              }));
            },
            setShowLockers: (show: boolean) => {
              set({ showLockers: show });
            },
          
            closeAllLockers: () => {
              const { selectedMachine } = get();
              if (!selectedMachine) {
                toast.error("Please select a machine first");
                return;
              }
              const updatedMachine = {
                ...selectedMachine,
                lockers: selectedMachine?.lockers.map(locker => ({
                  ...locker,
                  isOpen: false
                }))
              };
          
              set({ 
                selectedMachine:updatedMachine,
                selectedLocker: null,
              });
              
              toast.success("All lockers closed successfully!");
            },
          
            checkAllDoorsClosed: () => {
              const { selectedMachine } = get();
                return !selectedMachine || selectedMachine.lockers.every(locker => !locker.isOpen);
            },
          
            setSelectedMachine: (machine) => {
              if (machine === null) {
                set({ selectedMachine: null, selectedLocker: null });
                return;
              }
          
              const { machines } = get();
              const machineExists = machines.some(m => m.id === machine.id);
              
              if (machineExists) {
                set({ selectedMachine: machine, selectedLocker: null });
              } else {
                toast.error("Invalid machine selection");
              }
            },
          
            setSelectedLocker: (lockerId) => {
              if (lockerId === null) {
                set({ selectedLocker: null });
                return;
              }
          
              const { selectedMachine, machines } = get();
              if (!selectedMachine) {
                toast.error("Please select a machine first");
                return;
              }
          
              const machine = machines.find(m => m.id === selectedMachine.id);
              const lockerExists = machine?.lockers.some(locker => locker.id === lockerId);
          
              if (lockerExists) {
                set({ selectedLocker: lockerId });
              } else {
                toast.error("Invalid locker selection");
              }
            },
          
            openLocker: (lockerId) => {
              const { selectedMachine, machines } = get();
              if (!selectedMachine) {
                toast.error("Please select a machine first");
                return;
              }
          
              const machineIndex = machines.findIndex(m => m.id === selectedMachine.id);
              if (machineIndex === -1) {
                toast.error("Selected machine not found");
                return;
              }
          
              const machine = machines[machineIndex];
              const lockerIndex = machine.lockers.findIndex(l => l.id === lockerId);
              
              if (lockerIndex === -1) {
                toast.error("Invalid locker selection");
                return;
              }
          
              const updatedMachines = [...machines];
              updatedMachines[machineIndex] = {
                ...machine,
                lockers: machine.lockers.map((locker) =>
                  locker.id === lockerId
                    ? { ...locker, isOpen: true}
                    : locker
                ),
              };
          
              set({
                machines: updatedMachines,
                selectedLocker: lockerId,
              });
            },
          
            toggleQrScanner: (isOpen) => set({ isQrScannerOpen: isOpen }),
          
            toggleQrCodes: () => set((state) => ({ showQrCodes: !state.showQrCodes })),
          
            handleQrScan: (result, productIds) => {
              const { machines, selectedMachine } = get();
              if (!result) {
                toast.error("Invalid QR code");
                return;
              }
          
              if (!selectedMachine) {
                toast.error("Machine not found");
                return;
              }
          
              if (selectedMachine.machineStatus !== "ACTIVE") {
                toast.error("Machine is not available");
                return;
              }

          
              const updatedMachines = machines.map(machine => ({
                ...machine,
                available: machine.id === selectedMachine.id
              }));

          
              set({ 
                selectedMachine: {
                  ...selectedMachine,
                  lockers: selectedMachine.lockers?.map(locker => {
                    return ({
                      ...locker,
                      isOpen: locker?.stocks?.some(s => productIds.includes(s.product?.documentId)),
                    })
                  }),
                },
                isQrScannerOpen: false,
                showLockers: true,
                machines: updatedMachines
              });
              
              toast.success("Machine opened!", {
                description: "Pick your items from the locker",
              });


              const missingProducts = productIds.filter(id => !selectedMachine.lockers.some(locker => locker.stocks.some(s => s?.product?.documentId === id)));
              if (missingProducts.length > 0) {
                console.log(missingProducts)
                toast.warning("Some products are missing in the locker", {
                  description: "Please select another machine or contact support",
                  dismissible: true,
                });
              }
            },
          
            updateProductQuantity: (productId, increment) => {
              const { selectedMachine, selectedLocker, machines } = get();
            
              if (!selectedMachine || !selectedLocker) {
                toast.error("Please select both machine and locker");
                return;
              }


              const locker = selectedMachine.lockers.find((locker) => locker.id === selectedLocker);

              if (!locker) {
                toast.error("Locker not found");
                return;
              }

            
              const stockIndex = locker.stocks.findIndex(s => s.product.documentId === productId);
              if (stockIndex === -1) {
                toast.error("Product not found");
                return;
              }
            
              const stock = locker.stocks[stockIndex]


            
              let newQuantity = stock.quantity;
              if (increment) {
                newQuantity = Math.min((stock.quantity || 0) + 1, stock.originalQuantity || 0);
              } else {
                newQuantity = Math.max((stock.quantity || 0) - 1, 0);
              }
            
            
              if (newQuantity !== stock.quantity) {
                const updatedStock = {
                  ...stock,
                  quantity: newQuantity,
                };

                const updatedLockers = selectedMachine.lockers.map((locker) =>
                  locker.id === selectedLocker
                    ? {
                        ...locker,
                        stocks: locker.stocks.map((s) =>
                          s.product.documentId === productId ? updatedStock : s
                        ),
                      }
                    : locker
                );

                console.log(updatedLockers)
                const updatedMachine = {
                  ...selectedMachine,
                  lockers: updatedLockers,
                };
                const newMachines = machines.map((m) =>
                {
                  console.log(updatedMachine.id, m.id)
                  return m.id === selectedMachine.id ? {
                    ...m,
                    lockers: updatedLockers
                  } : m
                }
                );

                console.log(newMachines)
            
                set({ machines: newMachines });
              }
            },
          })));
    return (
        <MachineContext.Provider value={store}>
            {props.children}
        </MachineContext.Provider>
    );
}


