import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";

const CartDrawer = () => {
  const { items, isOpen, setOpen, update, remove, total, count } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-auto left-0 bottom-0 z-50 w-full max-w-md bg-surface border-l border-border flex flex-col"
          >
            <header className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-extrabold text-lg">سلتك ({count})</h3>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="font-bold">سلتك فارغة</p>
                <button
                  onClick={() => setOpen(false)}
                  className="px-6 h-11 rounded-xl bg-gradient-primary text-primary-foreground font-bold"
                >
                  ابدأ التسوق
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {items.map((i) => (
                    <div key={i.id} className="flex gap-3 p-3 rounded-xl bg-background border border-border">
                      <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold line-clamp-1">{i.name}</h4>
                        <div className="text-xs text-muted-foreground mt-1">{formatPrice(i.price)}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button onClick={() => update(i.id, i.quantity - 1)} className="w-7 h-7 hover:bg-secondary">
                              <Minus className="w-3 h-3 mx-auto" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold">{i.quantity}</span>
                            <button onClick={() => update(i.id, i.quantity + 1)} className="w-7 h-7 hover:bg-secondary">
                              <Plus className="w-3 h-3 mx-auto" />
                            </button>
                          </div>
                          <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive ms-auto">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <footer className="border-t border-border p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="text-success font-bold">مجاني</span>
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="كود خصم" className="flex-1 h-10 px-3 rounded-xl bg-background border border-border text-sm" />
                    <button className="px-4 h-10 rounded-xl bg-secondary font-bold text-sm">تطبيق</button>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold">
                    <span>الإجمالي</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/checkout");
                    }}
                    className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold"
                  >
                    إتمام الشراء
                  </button>
                  <button onClick={() => setOpen(false)} className="w-full text-sm text-muted-foreground hover:text-primary">
                    متابعة التسوق
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
