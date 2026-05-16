import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WishlistCtx {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
}
const WishlistContext = createContext<WishlistCtx | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(ids));
  }, [ids]);
  const toggle = (id: string) =>
    setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const has = (id: string) => ids.includes(id);
  const remove = (id: string) => setIds((p) => p.filter((x) => x !== id));
  return <WishlistContext.Provider value={{ ids, toggle, has, remove }}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const c = useContext(WishlistContext);
  if (!c) throw new Error("useWishlist must be used in WishlistProvider");
  return c;
};
