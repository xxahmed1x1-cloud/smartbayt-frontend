import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Truck, RotateCcw, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { productsApi } from "@/api/products";
import { settingsApi } from "@/api/other";
import { resolveImageUrl, formatPrice } from "@/utils/format";

interface HeroSettings {
  title?: string;
  subtitle?: string;
  cta?: string;
  image_url?: string;
}

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

const Hero = () => {
  const [settings, setSettings] = useState<HeroSettings>({});
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);

  // جيب إعدادات الـ Hero من الـ API
  useEffect(() => {
    settingsApi.getByKey("hero")
      .then((data) => {
        if (data?.value) {
          const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setSettings(val);
        }
      })
      .catch(() => {});
  }, []);

  // جيب أول 3 منتجات — بس لو مفيش صورة Hero من الإعدادات
  useEffect(() => {
    if (settings.image_url) return; // لو في صورة → مش محتاجين منتجات
    productsApi.getAll({ pageSize: 3, active: true })
      .then((res) => {
        const list = (res.data || res || []).slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: resolveImageUrl(p.image),
        }));
        setFeatured(list);
      })
      .catch(() => {});
  }, [settings.image_url]);

  const title = settings.title || "اجعل منزلك";
  const titleHighlight = "أكثر ذكاءً";
  const titleEnd = "اليوم";
  const subtitle = settings.subtitle || "اكتشف أجهزة المنزل الذكي المدعومة بالذكاء الاصطناعي، صممت لتجعل حياتك أسهل وأكثر راحة.";
  const cta = settings.cta || "تسوق الآن";

  // لو في صورة Hero من الإعدادات، نعرضها بدل المنتجات
  const heroImage = settings.image_url ? resolveImageUrl(settings.image_url) : null;

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container relative grid md:grid-cols-5 gap-12 items-center">
        {/* النص */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3 space-y-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> مخصص لك
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            {settings.title ? (
              settings.title
            ) : (
              <>
                {title} <span className="text-gradient">{titleHighlight}</span> {titleEnd}
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop"
              className="inline-flex items-center gap-2 px-7 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold shadow-elegant hover:opacity-90 transition-opacity">
              {cta} <ChevronLeft className="w-4 h-4" />
            </Link>
            <a href="#categories"
              className="inline-flex items-center gap-2 px-7 h-12 rounded-xl border border-border bg-surface/50 backdrop-blur font-bold hover:border-primary transition-colors">
              استعرض التصنيفات
            </a>
          </div>
          <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> +50 ألف عميل سعيد
            </span>
            <span className="inline-flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> شحن مجاني
            </span>
            <span className="inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary" /> إرجاع خلال 30 يوم
            </span>
          </div>
        </motion.div>

        {/* الصور */}
        <div className="md:col-span-2 relative h-[500px] hidden md:block">

          {/* لو في صورة Hero من الإعدادات */}
          {heroImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-accent/40 shadow-glow"
            >
              <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
            </motion.div>
          ) : featured.length > 0 ? (
            // لو فيه منتجات من الـ API
            featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                className={`absolute w-56 bg-surface rounded-2xl overflow-hidden border border-accent/40 shadow-glow ${
                  i === 0 ? "top-0 right-0" : i === 1 ? "top-32 left-0" : "bottom-0 right-12"
                }`}
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}>
                  <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                  <div className="p-3">
                    <div className="text-xs font-bold line-clamp-1">{p.name}</div>
                    <div className="text-sm font-extrabold text-primary mt-1">{formatPrice(p.price)}</div>
                  </div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            // Placeholder لو مفيش بيانات لسه
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-3xl border border-dashed border-border flex items-center justify-center"
            >
              <div className="text-center text-muted-foreground text-sm">
                <div className="text-4xl mb-2">🏠</div>
                <p>أضف صورة Hero من الإعدادات</p>
                <p className="text-xs mt-1">أو ستظهر المنتجات تلقائياً</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;