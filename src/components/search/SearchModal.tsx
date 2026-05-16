import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { formatPrice } from "@/utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
}

const popular = ["لمبة ذكية", "كاميرا أمان", "قابس ذكي", "ثرموستات"];

const SearchModal = ({ open, onClose }: Props) => {
  const [q, setQ] = useState("");
  const results = q.trim()
    ? products.filter((p) => p.name.includes(q) || p.category.includes(q))
    : [];

  useEffect(() => {
    if (!open) setQ("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const highlight = (text: string) => {
    if (!q.trim()) return text;
    const i = text.indexOf(q);
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <strong className="text-primary">{text.slice(i, i + q.length)}</strong>
        {text.slice(i + q.length)}
      </>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
          onClick={onClose}
        >
          <div className="container py-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b-2 border-primary pb-3">
              <Search className="w-6 h-6 text-primary" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="flex-1 bg-transparent outline-none text-xl font-bold placeholder:text-muted-foreground"
              />
              <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!q && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-3">عمليات البحث الشائعة:</p>
                <div className="flex flex-wrap gap-2">
                  {popular.map((p) => (
                    <button
                      key={p}
                      onClick={() => setQ(p)}
                      className="px-4 h-9 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-sm font-semibold transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q && (
              <div className="mt-6 space-y-2 max-h-[60vh] overflow-auto">
                {results.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">لا توجد نتائج</p>
                ) : (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface transition-colors"
                    >
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-bold">{highlight(p.name)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="px-2 py-0.5 rounded bg-secondary">{p.category}</span>
                        </div>
                      </div>
                      <div className="font-bold text-primary">{formatPrice(p.price)}</div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
