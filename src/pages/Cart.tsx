import { useCart } from "@/context/CartContext";

const Cart = () => {
  const { setOpen } = useCart();
  return (
    <main className="container pt-28 pb-16 min-h-screen text-center">
      <h1 className="text-4xl font-extrabold mb-4">السلة</h1>
      <p className="text-muted-foreground mb-6">يتم عرض السلة كقائمة جانبية.</p>
      <button onClick={() => setOpen(true)} className="px-7 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold">
        فتح السلة
      </button>
    </main>
  );
};

export default Cart;
