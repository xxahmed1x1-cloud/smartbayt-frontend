import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { formatPrice } from "@/utils/format";
import { toast } from "sonner";

const Wishlist = () => {
  const { ids, remove } = useWishlist();
  const { add } = useCart();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <main className="container pt-28 pb-16 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8">المفضلة</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold">قائمة المفضلة فارغة</p>
          <Link to="/shop" className="px-7 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold inline-flex items-center">
            ابدأ التسوق
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <div key={p.id} className="bg-surface rounded-2xl overflow-hidden border border-border">
              <Link to={`/product/${p.id}`} className="block aspect-square bg-muted">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </Link>
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm line-clamp-2 min-h-10">{p.name}</h3>
                <div className="text-primary font-extrabold">{formatPrice(p.price)}</div>
                <button
                  onClick={() => {
                    add(p);
                    toast.success("تمت الإضافة للسلة");
                  }}
                  className="w-full h-10 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm"
                >
                  نقل للسلة
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="w-full h-9 rounded-xl border border-border hover:border-destructive hover:text-destructive font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> إزالة من المفضلة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;
