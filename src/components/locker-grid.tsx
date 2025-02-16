import { Lock } from "lucide-react";

import type { Machine } from "@/types/locker";
import { useMachineStore } from "@/store/machine";

interface LockerGridProps {
	machine: Machine;
	onLockerToggle: (lockerId: number) => void;
}

export function LockerGrid({ machine, onLockerToggle }: LockerGridProps) {

	const closeAllLockers = useMachineStore(state => state.closeAllLockers)
	
	const handleOpen = (lockerId: number) => {
		onLockerToggle(lockerId);
		const locker = machine.lockers.find(l => l.id === lockerId);
		console.log('Opening locker:', locker);
	};



	return (
		<div className="flex flex-col items-center gap-4 w-full max-w-2xl">
			<button
				onClick={closeAllLockers}
				className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
			>
				Close All Lockers
			</button>
			<div className="grid grid-cols-4 gap-4 w-full">
				{machine.lockers.map(locker => (
					<div key={locker.id} className="aspect-square">
						<Locker
							id={locker.id}
							isOpen={locker.isOpen}
							isOccupied={locker.isOccupied}
							onToggle={() => {
									handleOpen(locker.id);
							}}
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
