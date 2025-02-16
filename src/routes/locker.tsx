import { useCart } from "@/store/cart";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, Minus, Plus, QrCode, RotateCcw, Server } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { LockerGrid } from "@/components/locker-grid";
import { Machines } from "@/components/machine";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useAuthStore from "@/store/auth";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import CartPopover from "@/components/cart-popover";
import { useMachineStore } from "@/store/machine";
import { Product } from "@/types/order";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/locker")({
  loader: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: SmartLockerApp,
});

function SmartLockerApp() {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const { addToCart, removeFromCart, resetCart } = useCart();
  const [isScanned, setIsScanned] = useState(false);
  const {
    machines,
    selectedLocker,
    selectedMachine,
    isQrScannerOpen,
    showQrCodes,
    resetMachines,
    setSelectedMachine,
    setSelectedLocker,
    toggleLockerState,
    toggleQrScanner,
    toggleQrCodes,
    handleQrScan,
    updateProductQuantity
  } = useMachineStore();

  const handleAddToCart = (product: Product) => {
    if (!product.quantity || product.quantity === 0) return;
    updateProductQuantity(product.id, false);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price.netPrice,
      quantity: 1
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId);
    updateProductQuantity(productId, true);
  };

  const handleQrCodeScan = (value: string) => {
    handleQrScan(value);
    setIsScanned(true);
  };

  useEffect(() => {
    if (!selectedMachine) {
      setIsScanned(false);
    }
  }, [selectedMachine]);

  const navigate = useNavigate()
  useEffect(() => {
    if (!user) {
      navigate({
      to: "/login",
    });
  }
  }, [user]);

  return (
    <section className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <Dialog open={selectedLocker !== null} onOpenChange={() => setSelectedLocker(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogDescription className="sr-only">Locker #{selectedLocker} Contents</DialogDescription>
            <DialogTitle>Locker #{selectedLocker} Contents</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedMachine && machines[selectedMachine].lockers
              .find(locker => locker.id === selectedLocker)?.products?.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">${product.price.netPrice.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleRemoveFromCart(product.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{product.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAddToCart(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <header className="flex gap-2 items-center w-full p-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Smart Locker System</h1>
        <Button onClick={logout} className="bg-red-500" variant={'destructive'}>Log out</Button>
        <RotateCcw className="ml-auto" onClick={()=> {
          resetMachines();
          resetCart();
          setIsScanned(false);
        }}/>
        <CartPopover />
      </header>

      <AnimatePresence mode="wait">
          <motion.div
            key="transaction"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.2,
              scale: { type: "spring", bounce: 0.4 },
            }}
            className="w-full max-w-[90rem]"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <motion.div
                className="flex-1 relative"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isQrScannerOpen ? (
                  <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center">
                     <Scanner onScan={(result) => handleQrCodeScan(result[0].rawValue) } allowMultiple/>
                    <button
                      onClick={() => toggleQrScanner(false)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : selectedMachine && isScanned ? (
                  <LockerGrid
                    machine={machines[selectedMachine]}
                    onLockerToggle={toggleLockerState}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <Server className="w-16 h-16 text-white/40 mb-4" />
                    <p className="text-white/80 text-lg font-medium">
                      Please Scan QR Code
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Scan the QR code to access the machine
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <Machines
                    machines={machines}
                    onMachineSelect={(machineId) => {
                      if (!selectedMachine)
                        setSelectedMachine(machineId);
                    }
                    }
                    selectedMachine={selectedMachine}
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => toggleQrScanner(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      Scan QR Code
                    </button>
                    <button
                      onClick={toggleQrCodes}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <QrCode className="w-5 h-5" />
                      {showQrCodes ? "Hide" : "Show"} QR Codes
                    </button>
                  </div>
                  {showQrCodes && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {Object.values(machines).map((machine) => (
                        <div
                          key={machine.id}
                          className="flex flex-col items-center"
                        >
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
              </motion.div>
            </div>
          </motion.div>
        
      </AnimatePresence>
    </section>
  );
}

export default SmartLockerApp;