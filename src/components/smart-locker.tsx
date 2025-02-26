import { useCart } from "@/store/cart";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Minus, Plus, RotateCcw, Server } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { LockerGrid } from "@/components/locker-grid";
import { Machines } from "@/components/machine";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAuthStore from "@/store/auth";
import { useNavigate } from "@tanstack/react-router";

import { Pickup, usePickup, useUpdatePickUpStatus } from "@/api/pickup-query";
import CartPopover from "@/components/cart-popover";
import { formatCurrency, Stock } from "@/lib/utils";
import {
    useMachineContext
} from "@/provider/machine-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";


type CheckoutFlow = "MACHINE" | "ORDER";


function SmartLockerApp() {
    const updatePickup = useUpdatePickUpStatus();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { cart, addToCart, removeFromCart, resetCart } = useCart();
    const [selectedFlow, setSelectedFlow] = useState<CheckoutFlow | null>(null);
  
    const [pickup, setPickup] = useState<Pickup | null>(null);
  
    const machines = useMachineContext((state) => state.machines);
    const showLockers = useMachineContext((state) => state.showLockers);
    const handleQrScan = useMachineContext((state) => state.handleQrScan);
    const resetMachines = useMachineContext((state) => state.resetMachines);
    const selectedLocker = useMachineContext((state) => state.selectedLocker);
    const selectedMachine = useMachineContext((state) => state.selectedMachine);
    const isQrScannerOpen = useMachineContext((state) => state.isQrScannerOpen);
    const toggleQrScanner = useMachineContext((state) => state.toggleQrScanner);
    const closeAllLockers = useMachineContext((state) => state.closeAllLockers);
    const checkAllDoorsClosed = useMachineContext(
      (state) => state.checkAllDoorsClosed
    );
  
    const setSelectedLocker = useMachineContext(
      (state) => state.setSelectedLocker
    );
    const setSelectedMachine = useMachineContext(
      (state) => state.setSelectedMachine
    );
    const updateProductQuantity = useMachineContext(
      (state) => state.updateProductQuantity
    );
  
    const handleAddToCart = (stock: Stock) => {
      if (!stock.quantity) return;
  
      const item = pickup?.items.find(
        (item) => item.product?.documentId === stock.product.documentId
      );
  
      if (!item) {
        toast.error("Can't Add to cart");
        return;
      }
      const maxQuantity = item.required <= stock.quantity ? item?.required : 0;
  
      addToCart({
        quantity: 1,
        maxQuantity,
        id: stock.product.documentId,
        name: stock.product.name,
        price: stock.product.price.netPrice,
      });

      const updatedStock = selectedMachine?.lockers.find(
        (locker) => locker.id === selectedLocker
      )?.stocks.find((s) => s.id === stock.id);

      if (updatedStock) {
        updateProductQuantity(stock.product.documentId, false);
      }
    };
  
    const handleRemoveFromCart = (productId: string) => {
      removeFromCart(productId);
      updateProductQuantity(productId, true);
    };
  
    const pickupQuery = usePickup();
    const handleOrderQrCodeScan = async (value: string) => {
      const { data: pickup } = await pickupQuery.mutateAsync(value);
  
      if (!pickup) return toast.error("Pickup not found");
      setPickup(pickup);

      const productIds = pickup.items.map((item) => item.product.documentId);
  
      try {
        await updatePickup.mutateAsync({
          pickupId: pickup.documentId,
          progress: "started",
        });
        handleQrScan(value, productIds);
      } catch (error) {
        void error
        console.log(error)
        toast.error("Failed to start order pickup");
      }
    };
  
    const navigate = useNavigate();
    useEffect(() => {
      if (!user) {
        navigate({
          to: "/login",
        });
      }
    }, [user]);
  
    return (
      <section className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
        <Dialog
          open={
            selectedLocker !== null &&
            !!selectedMachine?.lockers.find(
              (locker) => locker.id === selectedLocker
            )?.stocks.length
          }
          onOpenChange={() => setSelectedLocker(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogDescription className="sr-only">
                Locker #{selectedLocker} Contents
              </DialogDescription>
              <DialogTitle>Locker #{selectedLocker} Contents</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedMachine &&
                selectedMachine.lockers
                  .find((locker) => locker.id === selectedLocker)
                  ?.stocks?.map((stock) => (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{stock.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(
                            stock.product.price.netPrice,
                            stock.product.price.currency
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleRemoveFromCart(stock.product.documentId)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{stock.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            handleAddToCart(stock);
                          }}
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
          <Button onClick={logout} className="bg-red-500" variant={"destructive"}>
            Log out
          </Button>
          <RotateCcw
            className="ml-auto"
            onClick={() => {
              resetMachines();
              resetCart();
              setSelectedFlow(null);
              setSelectedMachine(null);
            }}
          />
          {!checkAllDoorsClosed() && showLockers && (
            <Button
              onClick={() => {
                closeAllLockers();
                setSelectedMachine(null);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
            >
              Close All Lockers
            </Button>
          )}
          <CartPopover
            onCheckout={async () => {
              if (!checkAllDoorsClosed()) {
                toast.error("Please close all lockers before checking out");
                return;
              }
              if (!pickup) {
                toast.error("Please select a pickup order");
                return;
              }
  
              const items = pickup.items.map((item) => {
                const updated = cart.find(
                  (i) => i.id === item.product.documentId
                );
                return updated
                  ? {
                      product: item.product.documentId,
                      required: item.required,
                      shipped: updated.quantity,
                    }
                  : {
                      product: item.product.documentId,
                      required: item.required,
                      shipped: item.shipped,
                    };
              });
  
              await updatePickup.mutateAsync({
                items,
                pickupId: pickup?.documentId,
                progress: "finished",
              });
              resetMachines();
              resetCart();
              setSelectedFlow(null);
              toast.success("Checkout Succcessful", {
                description: "Thanks for shopping with us!",
              });
            }}
          />
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
                {/* MACHINE FLOW : STEP 3 - Open Scanner */}
                {selectedFlow === "MACHINE" &&
                selectedMachine &&
                isQrScannerOpen ? (
                  <div className=" bg-black/80 flex flex-col items-center justify-center">
                    <Scanner
                      onScan={(result) =>
                        handleOrderQrCodeScan(result[0].rawValue)
                      }
                      allowMultiple
                    />
                    <Button
                      onClick={() => toggleQrScanner(false)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : selectedMachine && selectedFlow === "ORDER" ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    {/* ORDER FLOW: STEP 3 - Show QR Code */}
                    <p className="text-white/80 text-lg font-medium mb-6">
                      {selectedMachine.name}
                    </p>
                    <QRCodeSVG
                      value={selectedMachine.qrCode}
                      size={300}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      className="mb-6"
                    />
                  </div>
                ) : selectedMachine && showLockers ? (
                  <LockerGrid machine={selectedMachine} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    {/* STEP 1: Select Flow */}
                    {!selectedFlow ? (
                      <>
                        <Server className="w-16 h-16 text-white/40 mb-4" />
                        <p className="text-white/80 text-lg font-medium mb-4">
                          Select Transaction Mode
                        </p>
                        <RadioGroup
                          value={selectedFlow ?? undefined}
                          onValueChange={(value: CheckoutFlow) =>
                            setSelectedFlow(value)
                          }
                          className="mb-4 flex "
                        >
                          <div className="flex items-center space-x-2 border border-white/10 rounded-lg p-2 **:hover:cursor-pointe">
                            <RadioGroupItem value="MACHINE" id="machine" />
                            <Label htmlFor="machine" className="text-white">
                              Order Pickup
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border border-white/10 rounded-lg p-2 **:hover:cursor-pointer">
                            <RadioGroupItem value="ORDER" id="order" />
                            <Label htmlFor="order" className="text-white">
                              Machine Purchase
                            </Label>
                          </div>
                        </RadioGroup>
                      </>
                    ) : (
                      <>
                        <Server className="w-16 h-16 text-white/40 mb-4" />
                        <p className="text-white/80 text-lg font-medium">
                          Please Select a machine
                        </p>
                        <p className="text-white/60 text-sm mt-2">
                          Select the machine to continue
                        </p>
                      </>
                    )}
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
                  {/* STEP 2: Select Machine */}
                  <Machines
                    machines={machines}
                    onMachineSelect={(machine) => {
                      if (machines.some((m) => m.available))
                        return toast.error(
                          "Please close the locker before selecting another machine"
                        );
  
                      setSelectedMachine(machine);
                      if (selectedFlow === "MACHINE") {
                        toggleQrScanner(true);
                      }
                    }}
                    selectedMachine={selectedMachine}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    );
  }
  
  export default SmartLockerApp;
  