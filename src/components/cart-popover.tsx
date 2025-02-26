import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart } from "lucide-react"

import { useCart } from "@/store/cart"
import { Separator } from "./ui/seperator"
import { formatCurrency } from "@/lib/utils"

export default function CartPopover({onCheckout}: {onCheckout: () => Promise<void>}) {
  const { cart } = useCart();
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Shopping Cart</span>
          <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white/5 backdrop-blur-md">
        <h3 className="font-medium text-lg mb-4">Shopping Cart</h3>
        <ScrollArea className="h-[300px] pr-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity, "EUR")}</p>
            </div>
          ))}
        </ScrollArea>
        <Separator className="my-4" />
        <div className="flex justify-between mb-4">
          <p className="font-medium">Total</p>
          <p className="font-medium">{formatCurrency(totalPrice, "EUR")}</p>
        </div>
        <Button className="w-full"
        disabled={!cart.length}
        onClick={onCheckout}
        >Checkout</Button>
      </PopoverContent>
    </Popover>
  )
}