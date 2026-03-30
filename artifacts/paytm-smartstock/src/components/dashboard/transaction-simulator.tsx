import { useState, useEffect } from "react";
import { useGetInventory, useCreateTransaction } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useSmartAlert } from "@/hooks/use-smart-alert";

interface Props {
  onAlertTriggered: (alert: any) => void;
}

export function TransactionSimulator({ onAlertTriggered }: Props) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const queryClient = useQueryClient();

  const { data: inventory } = useGetInventory();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  // Auto-select first product when loaded
  useEffect(() => {
    if (inventory?.length && !productId) {
      setProductId(inventory[0].id);
    }
  }, [inventory, productId]);

  const selectedProduct = inventory?.find(i => i.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity < 1) return;

    createTransaction(
      { data: { productId, quantity } },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
          queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
          
          if (res.alert && res.alert.triggered) {
            onAlertTriggered(res.alert);
          }
          
          // Reset quantity but keep product selected for rapid entry
          setQuantity(1);
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-[#002970]/5 to-transparent">
        <h2 className="font-display font-bold text-lg text-primary flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Point of Sale Simulator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Log a sale to update live inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 flex-1 flex flex-col gap-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Select Product</label>
          <select 
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all appearance-none cursor-pointer"
          >
            {inventory?.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.currentStock} in stock)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex justify-between">
            <span>Quantity</span>
            <span className="text-muted-foreground font-normal">
              Price: {selectedProduct ? formatCurrency(selectedProduct.price) : "₹0"}
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="w-16 px-3 py-2 bg-muted/50 rounded-lg text-center font-semibold border border-border/50">
              {quantity}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground text-sm font-medium">Total Amount</span>
            <span className="font-display font-bold text-2xl text-foreground">
              {formatCurrency((selectedProduct?.price || 0) * quantity)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isPending || !selectedProduct}
            className="w-full py-3.5 rounded-xl font-bold paytm-btn text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px] tracking-wide"
          >
            {isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              "Log Sale"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
