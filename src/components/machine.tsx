import { Server } from "lucide-react";

import type { Machine } from "@/types/locker";
import { toast } from "sonner";

interface MachinesProps {
	machines: Machine[];
	onMachineSelect: (machine: Machine | null) => void;
	selectedMachine: Machine | null;
}

export function Machines({
	machines,
	onMachineSelect,
	selectedMachine
}: MachinesProps) {
	return (
		<div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
			{machines.map((machine) => (
				<div
					key={machine.id}
					onClick={() => {
						if (!machine.available)
							return toast.error("Machine is not available");
						onMachineSelect(selectedMachine?.id === machine.id ? null : machine)
					}}
					className={`bg-white/5 rounded-lg p-4 backdrop-blur-md cursor-pointer transition-all duration-300 ${
						selectedMachine?.id === machine.id ? "ring-2 ring-blue-500 bg-white/10" : ""
					} ${
						!machine.available ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
					}`}
				>
					<div className="h-full flex flex-col justify-between">
						<Server className="w-8 h-8 text-white/60" />
						<div className="text-white/80 text-sm">
							<div className="flex items-center gap-2">
								<p className="font-medium">{machine.name}</p>
								<div
									className={`w-2 h-2 rounded-full ${
										machine.available ? "bg-amber-500" : machine.machineStatus === "ACTIVE" ? "bg-green-500" : "bg-red-500"
									}`}
								/>
							</div>
							<p className="text-white/60 text-xs mt-1">
								{machine.available ? "Busy": machine.machineStatus === "ACTIVE" ? "Online" : "Offline"}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
