import { Server } from "lucide-react";

import type { Machine } from "@/types/locker";

interface MachinesProps {
	machines: Record<string, Machine>;
	onMachineSelect: (machineId: string | null) => void;
	selectedMachine: string | null;
}

export function Machines({
	machines,
	onMachineSelect,
	selectedMachine
}: MachinesProps) {
	return (
		<div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
			{Object.values(machines).map(({ id, name, available }) => (
				<div
					key={id}
					onClick={() => onMachineSelect(selectedMachine === id ? null : id)}
					className={`bg-white/5 rounded-lg p-4 backdrop-blur-md cursor-pointer transition-all duration-300 ${
						selectedMachine === id ? "ring-2 ring-blue-500 bg-white/10" : ""
					} ${
						!available ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
					}`}
				>
					<div className="h-full flex flex-col justify-between">
						<Server className="w-8 h-8 text-white/60" />
						<div className="text-white/80 text-sm">
							<div className="flex items-center gap-2">
								<p className="font-medium">{name}</p>
								<div
									className={`w-2 h-2 rounded-full ${
										available ? "bg-green-500" : "bg-red-500"
									}`}
								/>
							</div>
							<p className="text-white/60 text-xs mt-1">
								{available ? "Online" : "Offline"}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
