import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartCtx {
  items: CartItem[];
  add: (p: Product, qty?: number, opts?: { color?: string; size?: string }) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (o: boolean) => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (p, qty = 1, opts) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing)
        return prev.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { ...p, quantity: qty, selectedColor: opts?.color, selectedSize: opts?.size }];
    });
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const update = (id: string, qty: number) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, isOpen, setOpen, count, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used in CartProvider");
  return c;
};
