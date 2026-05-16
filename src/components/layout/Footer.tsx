import { Facebook, Instagram, Youtube, Send, Twitter, Linkedin, Github, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { settingsApi } from "@/api/other";

export const SOCIAL_ICONS: Record<string, { Icon: any; color: string }> = {
  facebook: { Icon: Facebook, color: "hover:text-[#1877F2]" },
  instagram: { Icon: Instagram, color: "hover:text-[#E4405F]" },
  youtube: { Icon: Youtube, color: "hover:text-[#FF0000]" },
  telegram: { Icon: Send, color: "hover:text-[#26A5E4]" },
  twitter: { Icon: Twitter, color: "hover:text-[#1DA1F2]" },
  linkedin: { Icon: Linkedin, color: "hover:text-[#0A66C2]" },
  github: { Icon: Github, color: "hover:text-foreground" },
  whatsapp: { Icon: MessageCircle, color: "hover:text-[#25D366]" },
};

interface FooterCol { title: string; links: { label: string; to: string }[] }
interface SocialItem { platform: string; url: string }
interface FooterValue {
  brand_name?: string;
  about?: string;
  copyright?: string;
  payments?: string[];
  cols?: FooterCol[];
  socials?: SocialItem[];
}

const DEFAULT_COLS: FooterCol[] = [
  { title: "المتجر", links: [
    { label: "جميع المنتجات", to: "/shop" },
    { label: "التصنيفات", to: "/shop" },
    { label: "العروض", to: "/shop" },
    { label: "وصل حديثاً", to: "/shop" },
  ]},
  { title: "الدعم", links: [
    { label: "الأسئلة الشائعة", to: "/faq" },
    { label: "الشحن", to: "/contact" },
    { label: "الإرجاع", to: "/contact" },
    { label: "اتصل بنا", to: "/contact" },
  ]},
  { title: "الشركة", links: [
    { label: "من نحن", to: "/about" },
    { label: "تواصل معنا", to: "/contact" },
    { label: "المتجر", to: "/shop" },
    { label: "المفضلة", to: "/wishlist" },
  ]},
];

const DEFAULT_SOCIALS: SocialItem[] = [
  { platform: "facebook", url: "#" },
  { platform: "instagram", url: "#" },
  { platform: "youtube", url: "#" },
  { platform: "telegram", url: "#" },
];

const Footer = () => {
  const [v, setV] = useState<FooterValue>({});
  const [logo, setLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("سمارت فايب");

  useEffect(() => {
    settingsApi.getAll().then((data: any[]) => {
      (data || []).forEach((r: any) => {
        try {
          const val = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
          if (r.key === "footer") setV(val || {});
          if (r.key === "branding") {
            if (val?.logo_url) setLogo(val.logo_url);
            if (val?.site_name) setSiteName(val.site_name);
          }
        } catch {}
      });
    }).catch(() => {});
  }, []);

  const cols = v.cols && v.cols.length ? v.cols : DEFAULT_COLS;
  const socials = v.socials && v.socials.length ? v.socials : DEFAULT_SOCIALS;
  const payments = v.payments && v.payments.length ? v.payments : ["VISA", "Mastercard", "InstaPay", "Cash"];

  return (
    <footer className="bg-surface border-t border-border mt-24">
      <div className="container py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            {logo ? (
              <img src={logo} alt={siteName} className="h-10 w-auto" />
            ) : (
              <span className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </span>
            )}
            <span className="font-extrabold text-xl">{v.brand_name || siteName}</span>
          </Link>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {v.about || "متجرك المتخصص في أجهزة المنزل الذكي بالذكاء الاصطناعي."}
          </p>
          <div className="flex gap-3 flex-wrap">
            {socials.map((s, i) => {
              const def = SOCIAL_ICONS[s.platform.toLowerCase()] || SOCIAL_ICONS.facebook;
              const Icon = def.Icon;
              return (
                <motion.a
                  key={i}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={s.platform}
                  className={`w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center transition-colors ${def.color}`}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
        {cols.map((c, idx) => (
          <motion.div
            key={c.title + idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
          >
            <h4 className="font-bold mb-4">{c.title}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {c.links.map((l, i) => (
                <li key={i}>
                  <Link to={l.to || "/"} className="hover:text-primary transition-colors story-link inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>{v.copyright || `© ${new Date().getFullYear()} ${siteName}. جميع الحقوق محفوظة.`}</span>
          <div className="flex gap-2 text-xs flex-wrap">
            {payments.map((p) => (
              <span key={p} className="px-2 py-1 rounded bg-background border border-border">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;