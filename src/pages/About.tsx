import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Award, Cpu, HeartHandshake, Leaf, Rocket, ShieldCheck, Sparkles, Target, Truck, Users, Zap } from "lucide-react";
import CountUp from "@/components/CountUp";
import { settingsApi } from "@/api/other";

const VALUE_ICONS: Record<string, any> = { Cpu, ShieldCheck, Truck, HeartHandshake, Award, Users, Leaf, Rocket, Target };

interface Stat { value: number; prefix?: string; suffix?: string; decimals?: number; label: string }
interface Value { icon?: string; title: string; desc: string }
interface Milestone { year: string; title: string; desc: string }
interface Member { name: string; role: string; initials?: string }
interface AboutData {
  hero_badge?: string; hero_title?: string; hero_highlight?: string; hero_title_after?: string;
  hero_desc?: string; mission?: string; vision?: string;
  stats?: Stat[]; values?: Value[]; milestones?: Milestone[]; team?: Member[];
}

const DEFAULTS: AboutData = {
  hero_badge: "من نحن", hero_title: "نحوّل بيتك إلى", hero_highlight: "تجربة ذكية", hero_title_after: "متكاملة",
  hero_desc: "في سمارت فايب نؤمن أن المنزل الذكي ليس رفاهية، بل هو الطريقة الجديدة للعيش بأمان وراحة وكفاءة.",
  mission: "تمكين كل أسرة عربية من امتلاك منزل ذكي حقيقي بأسعار عادلة، مع تجربة شراء بسيطة ودعم فني متخصص.",
  vision: "أن نكون المنصة الأولى في الشرق الأوسط لحلول المنزل الذكي بالذكاء الاصطناعي بحلول 2030.",
  stats: [
    { value: 50000, prefix: "+", suffix: "", decimals: 0, label: "عميل سعيد" },
    { value: 1200, prefix: "+", suffix: "", decimals: 0, label: "منتج ذكي" },
    { value: 27, label: "محافظة نخدمها" },
    { value: 4.9, decimals: 1, suffix: "★", label: "متوسط التقييم" },
  ],
  values: [
    { icon: "Cpu", title: "تقنية متقدمة", desc: "نختار أحدث أجهزة المنزل الذكي المدعومة بالذكاء الاصطناعي." },
    { icon: "ShieldCheck", title: "ضمان أصلي", desc: "كل منتج يصلك مغلّف ومعتمد بضمان رسمي." },
    { icon: "Truck", title: "توصيل سريع", desc: "شحن لكل محافظات مصر خلال 24-72 ساعة." },
    { icon: "HeartHandshake", title: "دعم حقيقي", desc: "فريق دعم فني عربي 7 أيام في الأسبوع." },
  ],
  milestones: [
    { year: "2021", title: "البداية", desc: "تأسيس المتجر." },
    { year: "2022", title: "التوسع", desc: "تغطية 12 محافظة." },
    { year: "2023", title: "الشراكات", desc: "شراكات حصرية مع كبرى العلامات." },
    { year: "2024", title: "+50 ألف عميل", desc: "تجاوزنا 50 ألف عميل." },
    { year: "2025", title: "AI Hub", desc: "إطلاق منصتنا الذكية." },
  ],
  team: [
    { name: "أحمد منصور", role: "المؤسس والرئيس التنفيذي", initials: "أم" },
    { name: "سارة خليل", role: "مديرة المنتجات", initials: "سخ" },
    { name: "كريم عبدالله", role: "رئيس الدعم الفني", initials: "كع" },
    { name: "ندى السيد", role: "مديرة تجربة العميل", initials: "نس" },
  ],
};

const About = () => {
  const [d, setD] = useState<AboutData>(DEFAULTS);

  useEffect(() => {
    settingsApi.getByKey("about").then((data: any) => {
      try {
        const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        if (val) setD({ ...DEFAULTS, ...val });
      } catch {}
    }).catch(() => {});
  }, []);

  const stats = d.stats?.length ? d.stats : DEFAULTS.stats!;
  const values = d.values?.length ? d.values : DEFAULTS.values!;
  const milestones = d.milestones?.length ? d.milestones : DEFAULTS.milestones!;
  const team = d.team?.length ? d.team : DEFAULTS.team!;

  return (
    <main dir="rtl" className="min-h-screen pt-28 pb-16">
      <section className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-surface border border-border p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-5">
              <Sparkles className="w-3.5 h-3.5" />{d.hero_badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
              {d.hero_title}{" "}
              <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">{d.hero_highlight}</span>{" "}
              {d.hero_title_after}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">{d.hero_desc}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                <Zap className="w-4 h-4" /> تصفح المنتجات
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border bg-background font-bold hover:border-primary transition-colors">تواصل معنا</Link>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-surface border border-border rounded-2xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                <CountUp end={Number(s.value) || 0} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mt-16 grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4"><Target className="w-6 h-6" /></div>
          <h2 className="text-2xl font-extrabold mb-3">رسالتنا</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{d.mission}</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4"><Rocket className="w-6 h-6" /></div>
          <h2 className="text-2xl font-extrabold mb-3">رؤيتنا</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{d.vision}</p>
        </div>
      </section>

      <section className="container mt-16">
        <div className="text-center mb-10"><h2 className="text-3xl md:text-4xl font-extrabold mb-3">قيمنا</h2><p className="text-muted-foreground">المبادئ التي نعمل بها كل يوم</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => {
            const Icon = VALUE_ICONS[v.icon || "Sparkles"] || Sparkles;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-extrabold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="container mt-20">
        <div className="text-center mb-10"><h2 className="text-3xl md:text-4xl font-extrabold mb-3">رحلتنا</h2><p className="text-muted-foreground">من فكرة بسيطة إلى منصة رائدة</p></div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute right-4 md:right-1/2 md:translate-x-1/2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative pr-12 md:pr-0 md:grid md:grid-cols-2 md:gap-8 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
                <div className={`hidden md:block ${i % 2 === 0 ? "text-left" : "text-right"}`} />
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <span className="text-xs font-bold text-primary">{m.year}</span>
                  <h4 className="font-extrabold mt-1 mb-1">{m.title}</h4>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </div>
                <span className="absolute right-2 md:right-1/2 md:translate-x-1/2 top-5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mt-20">
        <div className="text-center mb-10"><h2 className="text-3xl md:text-4xl font-extrabold mb-3">فريقنا</h2><p className="text-muted-foreground">عقول شغوفة تقف خلف كل تجربة</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-surface border border-border rounded-2xl p-6 text-center hover:shadow-elegant transition-shadow">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-extrabold text-primary-foreground mb-4">
                {t.initials || t.name.slice(0, 2)}
              </div>
              <h4 className="font-extrabold">{t.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] opacity-10" />
          <h2 className="relative text-3xl md:text-4xl font-extrabold text-primary-foreground mb-3">جاهز تبدأ منزلك الذكي؟</h2>
          <p className="relative text-primary-foreground/80 mb-7">اكتشف منتجاتنا أو تواصل معنا لاستشارة مجانية.</p>
          <div className="relative flex flex-wrap gap-3 justify-center">
            <Link to="/shop" className="h-12 px-7 rounded-xl bg-background text-foreground font-bold hover:opacity-90 transition-opacity inline-flex items-center">تسوق الآن</Link>
            <Link to="/contact" className="h-12 px-7 rounded-xl bg-background/10 backdrop-blur border border-white/20 text-primary-foreground font-bold hover:bg-background/20 transition-colors inline-flex items-center">تواصل معنا</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;