import { useEffect, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import QuickViewModal from "@/components/products/QuickViewModal";
import { productsApi } from "@/api/products";
import { categoriesApi } from "@/api/categories";

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cat, setCat] = useState<string>("الكل");
  const [quick, setQuick] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ pageSize: 100, active: true }),
      categoriesApi.getAll(),
    ]).then(([prods, cats]) => {
      setProducts(prods.data || []);
      setCategories(cats || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = cat === "الكل" ? products : products.filter((p) => p.category === cat);

  // تحويل بيانات الـ API لنفس شكل الـ Product القديم
  const mapProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    rating: p.rating,
    reviews: p.reviews,
    badge: p.badge,
    image: p.image,
    description: p.description,
    stock: p.stock,
    features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : p.features,
    specs: typeof p.specs === "string" ? JSON.parse(p.specs || "[]") : p.specs,
  });

  return (
    <main className="container pt-28 pb-16">
      <h1 className="text-4xl font-extrabold mb-2">المتجر</h1>
      <p className="text-muted-foreground mb-8">جميع منتجاتنا الذكية في مكان واحد</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {["الكل", ...categories.map((c) => c.name)].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 h-9 rounded-full text-sm font-semibold transition-all ${
              cat === c ? "bg-gradient-primary text-primary-foreground" : "bg-surface border border-border hover:border-primary"
            }`}>
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">لا توجد منتجات</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={mapProduct(p)} onQuickView={(prod) => setQuick(prod)} />
          ))}
        </div>
      )}
      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </main>
  );
};

export default Shop;