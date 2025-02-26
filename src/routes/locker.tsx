
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { useMachines } from "@/api/machine-query";
import { Stock } from "@/lib/utils";
import {
  MachineProvider
} from "@/provider/machine-provider";
import SmartLockerApp from "@/components/smart-locker";

export const Route = createFileRoute("/locker")({
  loader: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: LockerPage,
});


function LockerPage() {
  const machineQuery = useMachines();

  const machines = (machineQuery.data?.data || []).map((machine) => {
    const mappedStocks = machine.stocks.reduce<Record<number, Stock[]>>(
      (acc, stock, i) => {
        const key = i % 16;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(stock);
        return acc;
      },
      {}
    );
    return {
      ...machine,
      lockers: new Array(16).fill(null).map((_, i) => ({
        id: i + 1,
        isOpen: true,
        isOccupied: true,
        stocks: mappedStocks[i] || [],
      })),
    };
  });

  if (machineQuery.isLoading) {
    return (
      <section className="bg-gradient-to-br from-gray-900 to-black w-full h-screen flex items-center justify-center">
        Loading...
      </section>
    );
  }
  if (machineQuery.isError) {
    return (
      <section className="bg-gradient-to-br from-gray-900 to-black w-full h-screen flex flex-col gap-4 items-center justify-center">
        <p>Error loading machines</p>
        <Button onClick={() => machineQuery.refetch()}>Retry</Button>
      </section>
    );
  }



  return (
    <MachineProvider
      initialState={{
        machines,
        onGoingTranx: false,
        showLockers: false,
        selectedMachine: null,
        selectedLocker: null,
        isQrScannerOpen: false,
        showQrCodes: false,
      }}
      machines={[]}
    >
      <SmartLockerApp />
    </MachineProvider>
  );
}

