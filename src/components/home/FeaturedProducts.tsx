import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import QuickViewModal from "@/components/products/QuickViewModal";
import { Product } from "@/data/products";
import { productsApi } from "@/api/products";
import { resolveImageUrl } from "@/utils/format";

const tabs = ["الكل", "وصل حديثاً", "الأكثر مبيعاً", "عروض"];

const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  originalPrice: p.originalPrice ?? undefined,
  rating: p.rating ?? 0,
  reviews: p.reviews ?? 0,
  badge: p.badge ?? undefined,
  image: resolveImageUrl(p.image),
  description: p.description || "",
  stock: p.stock ?? 0,
  features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : (p.features ?? []),
  specs: typeof p.specs === "string" ? JSON.parse(p.specs || "[]") : (p.specs ?? []),
});

const FeaturedProducts = () => {
  const [tab, setTab] = useState("الكل");
  const [quick, setQuick] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = { pageSize: 12, active: true };
    if (tab === "وصل حديثاً") params.badge = "جديد";
    if (tab === "عروض") params.hasDiscount = true;

    productsApi.getAll(params)
      .then((res) => {
        let list = (res.data || res || []).map(mapProduct);
        if (tab === "الأكثر مبيعاً") list = list.filter((p: Product) => p.reviews > 50);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <section className="container py-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">منتجات مميزة</h2>
        <p className="text-muted-foreground">مختارة خصيصاً لك</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 h-10 rounded-full text-sm font-semibold transition-all ${
              tab === t ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "bg-surface border border-border hover:border-primary"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border animate-pulse h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">لا توجد منتجات في هذا التصنيف</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuick} />
          ))}
        </div>
      )}
      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </section>
  );
};

export default FeaturedProducts;