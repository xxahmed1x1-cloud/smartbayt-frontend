import { motion } from "framer-motion";
import { Eye, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, resolveImageUrl } from "@/utils/format";
import { toast } from "sonner";

interface Props {
  product: Product;
  onQuickView?: (p: Product) => void;
}

const ProductCard = ({ product, onQuickView }: Props) => {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="group relative bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-elegant transition-all"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={resolveImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span
            className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
              product.badge === "تخفيض"
                ? "bg-destructive text-destructive-foreground"
                : "bg-success text-success-foreground"
            }`}
          >
            {product.badge}
          </span>
        )}
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
          toast(wished ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
        }}
        className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="مفضلة"
      >
        <motion.span animate={{ scale: wished ? [1, 1.3, 1] : 1 }}>
          <Heart className={`w-4 h-4 ${wished ? "fill-destructive text-destructive" : ""}`} />
        </motion.span>
      </button>

      {onQuickView && (
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-14 left-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
          aria-label="عرض سريع"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-sm line-clamp-2 min-h-10 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-foreground">{product.rating}</span>
          <span>({product.reviews} تقييم)</span>
        </div>
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-lg font-extrabold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            add(product);
            toast.success("تمت الإضافة للسلة");
          }}
          className="w-full mt-3 h-10 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm hover:shadow-glow transition-shadow"
        >
          أضف للسلة
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;