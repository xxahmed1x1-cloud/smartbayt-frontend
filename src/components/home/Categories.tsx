import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { categoriesApi } from "@/api/categories";

const DEFAULT_ICON = "📦";
const ICON_MAP: Record<string, string> = {
  "إضاءة": "💡", "إضاءة ذكية": "💡",
  "أمن": "🛡️", "أمن وحماية": "🛡️", "حماية": "🛡️",
  "مطبخ": "🍳", "مطبخ ذكي": "🍳",
  "ترفيه": "🎬", "ترفيه ذكي": "🎬",
  "صوت": "🔊", "شبكات": "📡", "طاقة": "⚡", "أجهزة": "📱",
};
const getIcon = (name: string, icon?: string) => {
  if (icon && icon.trim()) return icon;
  for (const key of Object.keys(ICON_MAP)) {
    if (name.includes(key)) return ICON_MAP[key];
  }
  return DEFAULT_ICON;
};

interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  productCount?: number;
  count?: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setCategories(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="categories" className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">تسوق حسب التصنيف</h2>
        <p className="text-muted-foreground">اختر من بين تصنيفاتنا المتنوعة</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 border border-border animate-pulse h-32" />
            ))
          : categories.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="group relative bg-surface rounded-2xl p-6 border border-border hover:border-accent/60 hover:shadow-glow transition-all overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="relative">
                    <div className="text-5xl mb-3">{getIcon(c.name, c.icon)}</div>
                    <h3 className="font-bold mb-1">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.productCount ?? c.count ?? 0} منتج</p>
                  </div>
                </Link>
              </motion.div>
            ))
        }
      </div>
    </section>
  );
};

export default Categories;