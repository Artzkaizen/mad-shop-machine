import { Camera, QrCode, Server } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { QrReader } from "react-qr-reader";

import type { Machine } from "@/types/locker";

import { LockerGrid } from "@/components/locker-grid";
import { Machines } from "@/components/machine";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/locker")({
	component: SmartLockerApp
});

const INITIAL_MACHINES: Record<string, Machine> = {
	machine1: {
		id: "machine1",
		name: "Machine 1",
		available: true,
		qrCode: "locker-machine1",
		lockers: Array.from({ length: 16 }, (_, i) => ({
			id: i + 1,
			isOpen: true,
			isOccupied: false
		}))
	},
	machine2: {
		id: "machine2",
		name: "Machine 2",
		available: true,
		qrCode: "locker-machine2",
		lockers: Array.from({ length: 16 }, (_, i) => ({
			id: i + 1,
			isOpen: false,
			isOccupied: false
		}))
	},
	machine3: {
		id: "machine3",
		name: "Machine 3",
		available: false,
		qrCode: "locker-machine3",
		lockers: Array.from({ length: 16 }, (_, i) => ({
			id: i + 1,
			isOpen: false,
			isOccupied: false
		}))
	}
};

function SmartLockerApp() {
	const [machines, setMachines] = useState<Record<string, Machine>>(
		INITIAL_MACHINES
	);
	const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
	const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
	const [showQrCodes, setShowQrCodes] = useState(false);

	const handleQrScan = (result: string | null) => {
		console.log(result);
		if (result) {
			// Find machine by QR code
			const matchedMachine = Object.values(machines).find(
				machine => machine.qrCode === result
			);

			if (matchedMachine && matchedMachine.available) {
				setSelectedMachine(matchedMachine.id);
				setIsQrScannerOpen(false);
				alert("Machine scanned!");
			}
			else {
				alert("Invalid or Unavailable Machine");
			}
		}
	};

	const toggleLockerState = (lockerId: number) => {
		if (!selectedMachine)
			return;

		setMachines((prev) => {
			const updatedMachines = { ...prev };
			const machine = updatedMachines[selectedMachine];
			const updatedLockers = [...machine.lockers];
			const lockerIndex = updatedLockers.findIndex(l => l.id === lockerId);

			if (lockerIndex !== -1) {
				updatedLockers[lockerIndex] = {
					...updatedLockers[lockerIndex],
					isOpen: !updatedLockers[lockerIndex].isOpen
				};

				machine.lockers = updatedLockers;
			}

			return updatedMachines;
		});
	};

	return (
		<section className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
			<h1 className="text-3xl font-bold mb-8 text-white">
				Smart Locker System
			</h1>
			<div className="w-full max-w-[90rem] flex flex-col lg:flex-row gap-8">
				<div className="flex-1 relative">
					{isQrScannerOpen
						? (
								<div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center">
									<QrReader
										constraints={{ facingMode: "environment" }}
										onResult={(result, error) => {
											if (result) {
												console.log(result);

												handleQrScan(result.getText());
											}
											if (error) {
												console.info(error);
											}
										}}
										className="w-full h-full"
									/>
									<button
										onClick={() => setIsQrScannerOpen(false)}
										className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
									>
										Cancel
									</button>
								</div>
							)
						: selectedMachine
							? (
									<LockerGrid
										machine={machines[selectedMachine]}
										onLockerToggle={toggleLockerState}
									/>
								)
							: (
									<div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
										<Server className="w-16 h-16 text-white/40 mb-4" />
										<p className="text-white/80 text-lg font-medium">
											Please Select a Machine
										</p>
										<p className="text-white/60 text-sm mt-2">
											Choose a machine from the right panel or scan a QR code
										</p>
									</div>
								)}
				</div>
				<div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
					<div className="transform hover:scale-105 transition-transform duration-300">
						<Machines
							machines={machines}
							onMachineSelect={setSelectedMachine}
							selectedMachine={selectedMachine}
						/>
						<div className="flex gap-2 mt-4">
							<button
								onClick={() => setIsQrScannerOpen(true)}
								className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								<Camera className="w-5 h-5" />
								Scan QR Code
							</button>
							<button
								onClick={() => setShowQrCodes(!showQrCodes)}
								className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
							>
								<QrCode className="w-5 h-5" />
								{showQrCodes ? "Hide" : "Show"}
								{" "}
								QR Codes
							</button>
						</div>
						{showQrCodes && (
							<div className="mt-4 grid grid-cols-3 gap-4">
								{Object.values(machines).map(machine => (
									<div key={machine.id} className="flex flex-col items-center">
										<p className="text-white/80 mb-2">{machine.name}</p>
										<QRCodeSVG
											value={machine.qrCode}
											size={128}
											bgColor="#ffffff"
											fgColor="#000000"
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
