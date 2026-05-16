import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { contactApi, settingsApi } from "@/api/other";
import {
  Clock, Facebook, Headphones, Instagram, Mail, MapPin,
  MessageCircle, Phone, Send, Youtube,
} from "lucide-react";

const channels = [
  { icon: Phone, title: "اتصل بنا", desc: "خدمة عملاء على مدار اليوم", value: "+20 100 123 4567", href: "tel:+201001234567", color: "text-primary" },
  { icon: MessageCircle, title: "واتساب", desc: "دعم سريع عبر الواتساب", value: "+20 100 123 4567", href: "https://wa.me/201001234567", color: "text-success" },
  { icon: Mail, title: "البريد الإلكتروني", desc: "للاستفسارات والشكاوى", value: "support@smartvibe.com", href: "mailto:support@smartvibe.com", color: "text-accent" },
  { icon: MapPin, title: "العنوان", desc: "المقر الرئيسي", value: "القاهرة الجديدة، التجمع الخامس", href: "#map", color: "text-primary" },
];

const socials = [
  { Icon: Facebook, label: "Facebook", href: "#", color: "hover:text-[#1877F2]" },
  { Icon: Instagram, label: "Instagram", href: "#", color: "hover:text-[#E4405F]" },
  { Icon: Youtube, label: "YouTube", href: "#", color: "hover:text-[#FF0000]" },
  { Icon: Send, label: "Telegram", href: "#", color: "hover:text-[#26A5E4]" },
];

interface HourRow { label: string; value: string; highlight?: boolean }
const DEFAULT_HOURS: HourRow[] = [
  { label: "السبت - الخميس", value: "9 ص - 10 م" },
  { label: "الجمعة", value: "2 م - 10 م" },
  { label: "الدعم الفني", value: "24/7", highlight: true },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [hours, setHours] = useState<HourRow[]>(DEFAULT_HOURS);

  useEffect(() => {
    settingsApi.getByKey("contact").then((data: any) => {
      try {
        const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        if (Array.isArray(v.hours) && v.hours.length) setHours(v.hours);
      } catch {}
    }).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("بريد إلكتروني غير صالح");
    if (form.message.trim().length < 10) return toast.error("الرسالة قصيرة جداً");
    setSending(true);
    try {
      await contactApi.send({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });
      toast.success("تم إرسال رسالتك بنجاح، سنرد عليك خلال 24 ساعة.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch { toast.error("حدث خطأ، حاول مرة أخرى"); }
    finally { setSending(false); }
  };

  return (
    <main dir="rtl" className="min-h-screen pt-28 pb-16">
      <section className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-surface border border-border p-10 md:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
              <Headphones className="w-3.5 h-3.5" /> دعم العملاء
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">تواصل معنا</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">فريقنا متاح لمساعدتك في كل ما يخص منتجاتك وطلباتك.</p>
          </div>
        </motion.div>
      </section>

      <section className="container mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-elegant transition-all">
              <span className={`w-11 h-11 rounded-xl bg-background flex items-center justify-center mb-3 ${c.color}`}><Icon className="w-5 h-5" /></span>
              <h3 className="font-extrabold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{c.desc}</p>
              <p className="text-sm font-bold text-foreground" dir="ltr">{c.value}</p>
            </motion.a>
          );
        })}
      </section>

      <section className="container mt-14 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-extrabold mb-2">أرسل لنا رسالة</h2>
          <p className="text-sm text-muted-foreground mb-6">سنرد عليك خلال 24 ساعة عمل.</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="الاسم" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="محمد أحمد" />
              <Field label="البريد الإلكتروني" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="example@mail.com" type="email" />
              <Field label="رقم الهاتف" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="01xxxxxxxxx" type="tel" />
              <Field label="الموضوع" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} placeholder="استفسار عن منتج" />
            </div>
            <div>
              <label className="text-sm font-bold mb-1.5 block">الرسالة</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5}
                placeholder="اكتب رسالتك هنا..." className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
            </div>
            <button type="submit" disabled={sending}
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send className="w-4 h-4" />
              {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold">ساعات العمل</h3>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              {hours.map((h, i) => (
                <li key={i} className={`flex justify-between ${h.highlight ? "text-success" : ""}`}>
                  <span>{h.label}</span>
                  <span className={h.highlight ? "font-bold" : "text-foreground font-bold"}>{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="font-extrabold mb-3">تابعنا</h3>
            <div className="flex gap-3">
              {socials.map(({ Icon, label, href, color }) => (
                <a key={label} href={href} aria-label={label} className={`w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center transition-colors ${color}`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
            <h3 className="font-extrabold mb-2">دعم VIP للشركات</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">لطلبات الجملة وحلول الشركات، تواصل مع قسم المبيعات.</p>
            <a href="mailto:business@smartvibe.com" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-background text-foreground font-bold text-sm">
              <Mail className="w-4 h-4" /> business@smartvibe.com
            </a>
          </div>
        </div>
      </section>

      {/* --- تعديل الخريطة الجديد --- */}
      <section id="map" className="container mt-14">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/20 pointer-events-none z-10" />
          <iframe
            title="موقعنا"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55232.06240212906!2d31.4286576442657!3d30.008080313883732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458226937c44933%3A0x86392120401880a4!2sNew%20Cairo%20City%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1715495484848!5m2!1sen!2seg"
            className="w-full h-64 border-0 grayscale opacity-90"
            loading="lazy"
            allowFullScreen
          />
          <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-surface to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-sm">مقرنا الرئيسي</p>
                <p className="text-xs text-muted-foreground">التجمع الخامس، القاهرة الجديدة، مصر</p>
              </div>
              <a
                href="https://maps.app.goo.gl/9zM9S8x8Z1H2"
                target="_blank"
                rel="noreferrer"
                className="mr-auto text-xs text-primary font-bold hover:underline"
              >
                فتح في خرائط Google ←
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const Field = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; }) => (
  <div>
    <label className="text-sm font-bold mb-1.5 block">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
      className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
  </div>
);

export default Contact;