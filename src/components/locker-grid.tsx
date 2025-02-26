import { Lock } from "lucide-react";

import { useMachineContext } from "@/provider/machine-provider";
import type { Machine } from "@/types/locker";

interface LockerGridProps {
	machine: Machine | undefined;
}

export function LockerGrid({ machine }: LockerGridProps) {
  	const openLocker = useMachineContext((state) => state.openLocker);
	if (!machine)
		return null;
	return (
		<div className="flex flex-col items-center gap-4 w-full max-w-2xl">
			<div className="grid grid-cols-4 gap-4 w-full">
				{machine.lockers.map(locker => (
					<div key={locker.id} className="aspect-square">
						<Locker
							id={locker.id}
							isOpen={locker.isOpen}
							isOccupied={locker.isOccupied}
							onToggle={() => openLocker(locker.id)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

interface LockerProps {
	id: number;
	isOpen: boolean;
	isOccupied: boolean;
	onToggle: () => void;
}

function Locker({ id, isOpen, isOccupied, onToggle }: LockerProps) {

	return (
		<div
			onClick={onToggle}
			className={`w-full h-full rounded-2xl relative overflow-hidden transition-all duration-500 ease-in-out cursor-pointer 
        ${isOpen ? "bg-white/20" : "bg-white/5"} 
        backdrop-blur-md border border-white/10 hover:border-white/20 
        ${isOccupied ? "opacity-50" : ""}`}
		>
			{/* Door */}
			<div
				className={`absolute inset-0 bg-white/10 backdrop-blur-sm border-r border-white/20
          ${isOpen ? "door-open" : "door-closed"}`}
				style={{
					transformOrigin: "left",
					transformStyle: "preserve-3d"
				}}
			>
				{/* Door Handle */}
				<div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white/30 rounded-full" />
			</div>

			{/* Locker Content */}
			<div className="absolute inset-0 flex items-center justify-center">
				{isOpen
					? (
							<div className="text-sm font-medium text-white/90">
								#
								{id}
							</div>
						)
					: (
							<Lock className="w-6 h-6 text-white/60" />
						)}
			</div>
		</div>
	);
}
