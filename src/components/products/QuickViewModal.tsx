import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Props {
  product: Product | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: Props) => {
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto grid md:grid-cols-2 gap-6 p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold mb-2">{product.name}</h2>
            <div className="text-sm text-muted-foreground mb-3">
              ⭐ {product.rating} ({product.reviews} تقييم)
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-extrabold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-semibold">الكمية:</span>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 hover:bg-secondary">
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-10 h-10 hover:bg-secondary"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            <div className="text-sm text-success mb-4">✅ متوفر ({product.stock} قطعة متبقية)</div>

            <button
              onClick={() => {
                add(product, qty);
                toast.success("تمت الإضافة للسلة");
                onClose();
              }}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold mb-3"
            >
              أضف للسلة
            </button>
            <Link to={`/product/${product.id}`} onClick={onClose} className="text-sm text-primary text-center hover:underline">
              عرض التفاصيل كاملة
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
