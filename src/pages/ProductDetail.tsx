import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, RotateCcw, Shield, ShieldCheck, Star, Truck } from "lucide-react";
import { Product } from "@/data/products";
import { productsApi } from "@/api/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/utils/format";
import { toast } from "sonner";
import ProductCard from "@/components/products/ProductCard";
import ReviewForm from "@/components/ReviewForm";

const BASE_URL = "http://localhost:5224";
const resolveImg = (p?: string | null): string => {
  if (!p) return "/placeholder.svg";
  if (p.startsWith("http")) return p;
  return `${BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
};

const mapProduct = (p: any): Product => {
  let extraImages: string[] = [];
  try { extraImages = typeof p.images === "string" ? JSON.parse(p.images || "[]") : (p.images ?? []); } catch {}
  const mainImg = resolveImg(p.image);
  const allImages = [mainImg, ...extraImages.map(resolveImg).filter(img => img !== mainImg)];
  return {
    id: p.id, name: p.name, category: p.category, price: p.price,
    originalPrice: p.originalPrice ?? undefined, rating: p.rating, reviews: p.reviews,
    badge: p.badge ?? undefined, image: mainImg, images: allImages,
    description: p.description || "", stock: p.stock,
    features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : (p.features ?? []),
    specs: typeof p.specs === "string" ? JSON.parse(p.specs || "[]") : (p.specs ?? []),
  };
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [tab, setTab] = useState<"desc" | "reviews" | "shipping">("desc");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setActiveImg(0);
    productsApi.getById(id)
      .catch(() => productsApi.getBySlug(id))
      .then((data) => {
        const mapped = mapProduct(data);
        setProduct(mapped);
        setColor(mapped.colors?.[0]?.name || "");
        setSize(mapped.sizes?.[1] || "");
        return productsApi.getAll({ category: mapped.category, pageSize: 8, active: true })
          .then((res) => setRelated((res.data || []).map(mapProduct).filter((p: Product) => p.id !== mapped.id).slice(0, 4)))
          .catch(() => {});
      })
      .catch(() => navigate("/shop"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="container pt-28 pb-16 min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">جاري التحميل...</p>
    </main>
  );

  if (!product) return null;

  const wished = has(product.id);

  const stockStatus =
    product.stock === 0
      ? { text: "❌ نفذت الكمية", color: "text-destructive" }
      : product.stock < 5
      ? { text: `⚠️ ${product.stock} قطع فقط!`, color: "text-yellow-500" }
      : { text: `✅ متوفر (${product.stock} قطع)`, color: "text-success" };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;


  return (
    <main className="container pt-28 pb-16">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap gap-2">
        <Link to="/" className="hover:text-primary">الرئيسية</Link>
        <span>›</span>
        <Link to="/shop" className="hover:text-primary">المتجر</Link>
        <span>›</span>
        <span>{product.category}</span>
        <span>›</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* RIGHT (60%): gallery */}
        <div className="lg:col-span-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface border border-border group">
            <img src={product.images?.[activeImg] || product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            {product.badge && (
              <span
                className={`absolute top-4 right-4 text-sm font-bold px-3 py-1.5 rounded-full ${
                  product.badge === "تخفيض" ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"
                }`}
              >
                {product.badge}
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden bg-surface border-2 transition-colors ${activeImg === i ? "border-primary" : "border-border hover:border-primary/60"}`}>
                  <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LEFT (40%) sticky */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-5">
            <h1 className="text-3xl font-extrabold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews} تقييم)</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-xs font-bold">-{discount}%</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {product.colors && (
              <div>
                <p className="text-sm font-bold mb-2">اللون: {color}</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      style={{ background: c.value }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        color === c.name ? "border-accent shadow-glow scale-110" : "border-border"
                      }`}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && (
              <div>
                <p className="text-sm font-bold mb-2">المقاس</p>
                <div className="flex gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-12 h-10 px-4 rounded-full text-sm font-bold transition-all ${
                        size === s ? "bg-gradient-primary text-primary-foreground" : "bg-surface border border-border hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-bold mb-2">الكمية</p>
              <div className="flex items-center border border-border rounded-xl w-fit overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 hover:bg-secondary">
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-11 h-11 hover:bg-secondary">
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            <p className={`text-sm font-bold ${stockStatus.color}`}>{stockStatus.text}</p>

            <div className="flex gap-2">
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  add(product, qty, { color, size });
                  toast.success("تمت الإضافة للسلة");
                }}
                className="flex-1 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold disabled:opacity-50"
              >
                أضف للسلة
              </button>
              <button
                onClick={() => toggle(product.id)}
                className={`w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:border-destructive transition-colors ${
                  wished ? "text-destructive" : ""
                }`}
              >
                <Heart className={`w-5 h-5 ${wished ? "fill-destructive" : ""}`} />
              </button>
            </div>
            <button
              disabled={product.stock === 0}
              onClick={() => {
                add(product, qty, { color, size });
                navigate("/checkout");
              }}
              className="w-full h-12 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              اشتري الآن
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { Icon: Truck, text: "شحن مجاني فوق 500 جنيه" },
                { Icon: RotateCcw, text: "إرجاع خلال 30 يوم" },
                { Icon: ShieldCheck, text: "ضمان سنتين" },
                { Icon: Shield, text: "دفع آمن" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-border text-xs">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-2 border-b border-border mb-6">
          {[
            { id: "desc", label: "الوصف" },
            { id: "reviews", label: "التقييمات" },
            { id: "shipping", label: "الشحن والإرجاع" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-5 h-11 font-bold text-sm relative ${tab === t.id ? "text-primary" : "text-muted-foreground"}`}
            >
              {t.label}
              {tab === t.id && (
                <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {tab === "desc" && (
          <div className="prose max-w-none space-y-4 text-sm leading-loose text-muted-foreground">
            <p>{product.description}</p>
            <p>تم تصميم هذا المنتج بأعلى معايير الجودة ليناسب الاستخدام اليومي ويوفر تجربة استثنائية. يدعم جميع منصات المنزل الذكي الشائعة ويعمل بسلاسة مع تطبيقات الموبايل.</p>
            <p>التكامل مع المساعدات الصوتية مثل أليكسا و Google Home يجعل التحكم سهلاً عبر الأوامر الصوتية باللغة العربية.</p>
            {product.features && (
              <ul className="grid sm:grid-cols-2 gap-2 not-prose mt-6">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-foreground">
                    <span className="text-success">✅</span> {f}
                  </li>
                ))}
              </ul>
            )}
            {product.specs && (
              <table className="w-full mt-6 text-sm not-prose">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={s.key} className={i % 2 === 0 ? "bg-surface" : ""}>
                      <td className="p-3 font-bold w-1/3">{s.key}</td>
                      <td className="p-3 text-muted-foreground">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 p-6 rounded-2xl bg-surface border border-border h-fit">
              <div className="text-5xl font-extrabold text-primary">{product.rating}</div>
              <div className="flex gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{product.reviews} تقييم إجمالي</p>
              <div className="space-y-2 mt-5">
                {[
                  { stars: 5, pct: 68 },
                  { stars: 4, pct: 21 },
                  { stars: 3, pct: 8 },
                  { stars: 2, pct: 2 },
                  { stars: 1, pct: 1 },
                ].map((r) => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-12">{r.stars} نجوم</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-8 text-muted-foreground">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              {[
                { name: "أحمد محمد", date: "منذ 3 أيام", text: "منتج رائع وجودة ممتازة، التركيب سهل والتطبيق يعمل بشكل مثالي. أنصح به بشدة." },
                { name: "سارة علي", date: "منذ أسبوع", text: "تجربة ممتازة، الشحن سريع والمنتج بحالة جيدة جداً. التكامل مع الـ Google Home سهل." },
                { name: "محمود حسن", date: "منذ أسبوعين", text: "السعر مناسب جداً مقارنة بالجودة. شغال من شهر بدون أي مشاكل." },
                { name: "ندى إبراهيم", date: "منذ شهر", text: "أحد أفضل مشترياتي هذا العام. التصميم أنيق والوظائف متعددة." },
              ].map((r, i) => (
                <div key={i} className="p-5 rounded-2xl bg-surface border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.date}</div>
                    </div>
                    <div className="flex gap-0.5 ms-auto">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                  <button className="mt-3 text-xs font-bold text-primary hover:underline">مفيد؟ 👍</button>
                </div>
              ))}
              <ReviewForm productId={product.id} />
            </div>
          </div>
        )}

        {tab === "shipping" && (
          <div className="space-y-4 text-sm leading-loose text-muted-foreground max-w-3xl">
            <p>
              نقدم خدمة شحن سريعة لجميع محافظات مصر. الطلبات التي تزيد عن 500 جنيه تحصل على شحن مجاني تماماً.
              مدة الشحن من 2 إلى 5 أيام عمل بحسب الموقع.
            </p>
            <p>
              يمكنك إرجاع المنتج خلال 30 يوماً من تاريخ الاستلام في حال عدم الرضا، شرط أن يكون بحالته الأصلية مع جميع ملحقاته.
            </p>
            <p>الدفع الآمن متاح عبر البطاقات الائتمانية، InstaPay، أو الدفع عند الاستلام.</p>
          </div>
        )}
      </div>

      {/* Related */}
      <section className="mt-20">
        <h2 className="text-2xl font-extrabold mb-6">منتجات مشابهة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;