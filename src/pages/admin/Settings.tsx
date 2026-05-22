import { useEffect, useState, useRef } from "react";
import { settingsApi, uploadApi } from "@/api/other";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";

type Settings = Record<string, any>;
const SOCIAL_PLATFORMS = ["facebook", "instagram", "youtube", "telegram", "twitter", "linkedin", "github", "whatsapp"];

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5224";
const resolveImg = (p?: string | null) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `${BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
};

export default function AdminSettings() {
  const [s, setS] = useState<Settings>({ branding: {}, hero: {}, contact: {}, footer: {}, about: {} });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    settingsApi.getAll().then((data: any[]) => {
      const m: Settings = { branding: {}, hero: {}, contact: {}, footer: {}, about: {} };
      (data || []).forEach((r: any) => {
        try { m[r.key] = typeof r.value === "string" ? JSON.parse(r.value) : r.value || {}; } catch { m[r.key] = {}; }
      });
      m.footer.cols = m.footer.cols || [];
      m.footer.socials = m.footer.socials || [];
      m.footer.payments = m.footer.payments || [];
      m.contact.hours = m.contact.hours || [];
      m.about.stats = m.about.stats || [];
      m.about.values = m.about.values || [];
      m.about.milestones = m.about.milestones || [];
      m.about.team = m.about.team || [];
      setS(m);
    }).catch(() => {});
  }, []);

  const save = async (key: string) => {
    try {
      await settingsApi.upsert(key, JSON.stringify(s[key]));
      toast.success("تم الحفظ");
    } catch { toast.error("حدث خطأ"); }
  };

  const set = (key: string, field: string, value: any) => setS((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));
  const setFooter = (field: string, value: any) => set("footer", field, value);

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const res = await uploadApi.upload(file);
      set("branding", "logo_url", res.url);
      toast.success("تم رفع اللوغو");
    } catch { toast.error("فشل رفع الصورة"); }
    finally { setUploadingLogo(false); }
  };

  const handleUploadHero = async (file: File) => {
    setUploadingHero(true);
    try {
      const res = await uploadApi.upload(file);
      set("hero", "image_url", res.url);
      toast.success("تم رفع صورة Hero");
    } catch { toast.error("فشل رفع الصورة"); }
    finally { setUploadingHero(false); }
  };

  const addCol = () => setFooter("cols", [...(s.footer.cols || []), { title: "عمود جديد", links: [] }]);
  const removeCol = (i: number) => setFooter("cols", s.footer.cols.filter((_: any, idx: number) => idx !== i));
  const updateCol = (i: number, field: string, value: any) => {
    const next = [...s.footer.cols]; next[i] = { ...next[i], [field]: value }; setFooter("cols", next);
  };
  const addLink = (i: number) => updateCol(i, "links", [...(s.footer.cols[i].links || []), { label: "", to: "/" }]);
  const removeLink = (i: number, j: number) => updateCol(i, "links", s.footer.cols[i].links.filter((_: any, idx: number) => idx !== j));
  const updateLink = (i: number, j: number, field: string, value: string) => {
    const links = [...s.footer.cols[i].links]; links[j] = { ...links[j], [field]: value }; updateCol(i, "links", links);
  };
  const addSocial = () => setFooter("socials", [...(s.footer.socials || []), { platform: "facebook", url: "" }]);
  const removeSocial = (i: number) => setFooter("socials", s.footer.socials.filter((_: any, idx: number) => idx !== i));
  const updateSocial = (i: number, field: string, value: string) => {
    const next = [...s.footer.socials]; next[i] = { ...next[i], [field]: value }; setFooter("socials", next);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-3xl font-bold">إعدادات الموقع</h1></div>

      {/* الهوية والشعار */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-lg">الهوية والشعار</h2>
        <div><Label>اسم الموقع</Label><Input value={s.branding.site_name || ""} onChange={(e) => set("branding", "site_name", e.target.value)} /></div>
        <div><Label>الشعار التعريفي</Label><Input value={s.branding.tagline || ""} onChange={(e) => set("branding", "tagline", e.target.value)} /></div>
        <div>
          <Label>صورة اللوغو</Label>
          <div className="flex items-center gap-3 mt-1">
            {s.branding.logo_url && (
              <img src={resolveImg(s.branding.logo_url)} alt="logo" className="w-16 h-16 rounded-full object-cover border" />
            )}
            <div className="flex-1 space-y-2">
              <Input value={s.branding.logo_url || ""} onChange={(e) => set("branding", "logo_url", e.target.value)} placeholder="https://..." />
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUploadLogo(e.target.files[0]); }} />
              <Button type="button" variant="outline" size="sm" disabled={uploadingLogo} onClick={() => logoRef.current?.click()}>
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Upload className="w-4 h-4 me-1" />}
                رفع من الجهاز
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={() => save("branding")}>حفظ</Button>
      </Card>

      {/* Hero */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-lg">قسم Hero</h2>
        <div><Label>العنوان</Label><Input value={s.hero.title || ""} onChange={(e) => set("hero", "title", e.target.value)} /></div>
        <div><Label>العنوان الفرعي</Label><Textarea value={s.hero.subtitle || ""} onChange={(e) => set("hero", "subtitle", e.target.value)} /></div>
        <div><Label>نص زر CTA</Label><Input value={s.hero.cta || ""} onChange={(e) => set("hero", "cta", e.target.value)} /></div>
        <div>
          <Label>صورة Hero</Label>
          <div className="flex items-center gap-3 mt-1">
            {s.hero.image_url && (
              <img src={resolveImg(s.hero.image_url)} alt="hero" className="w-24 h-16 rounded-lg object-cover border" />
            )}
            <div className="flex-1 space-y-2">
              <Input value={s.hero.image_url || ""} onChange={(e) => set("hero", "image_url", e.target.value)} placeholder="https://..." />
              <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUploadHero(e.target.files[0]); }} />
              <Button type="button" variant="outline" size="sm" disabled={uploadingHero} onClick={() => heroRef.current?.click()}>
                {uploadingHero ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Upload className="w-4 h-4 me-1" />}
                رفع من الجهاز
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={() => save("hero")}>حفظ</Button>
      </Card>

      {/* التواصل */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-lg">معلومات التواصل</h2>
        {["email", "phone", "whatsapp", "address", "facebook", "instagram", "twitter"].map((k) => (
          <div key={k}><Label>{k}</Label><Input value={s.contact[k] || ""} onChange={(e) => set("contact", k, e.target.value)} /></div>
        ))}
        <Button onClick={() => save("contact")}>حفظ</Button>
      </Card>

      {/* Footer */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-lg">التذييل (Footer)</h2>
        <div><Label>اسم البراند</Label><Input value={s.footer.brand_name || ""} onChange={(e) => setFooter("brand_name", e.target.value)} /></div>
        <div><Label>نبذة عن الموقع</Label><Textarea value={s.footer.about || ""} onChange={(e) => setFooter("about", e.target.value)} /></div>
        <div><Label>نص حقوق النشر</Label><Input value={s.footer.copyright || ""} onChange={(e) => setFooter("copyright", e.target.value)} /></div>
        <div>
          <Label>وسائل الدفع (مفصولة بفاصلة)</Label>
          <Input value={(s.footer.payments || []).join(", ")} onChange={(e) => setFooter("payments", e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))} />
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-bold">أعمدة الروابط</Label>
            <Button type="button" size="sm" variant="outline" onClick={addCol}><Plus className="w-4 h-4 me-1" />إضافة عمود</Button>
          </div>
          <div className="space-y-3">
            {(s.footer.cols || []).map((col: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-background">
                <div className="flex gap-2 items-center">
                  <Input value={col.title || ""} onChange={(e) => updateCol(i, "title", e.target.value)} placeholder="عنوان العمود" />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeCol(i)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2 ps-2">
                  {(col.links || []).map((lnk: any, j: number) => (
                    <div key={j} className="flex gap-2 items-center">
                      <Input value={lnk.label || ""} onChange={(e) => updateLink(i, j, "label", e.target.value)} placeholder="نص الرابط" />
                      <Input value={lnk.to || ""} onChange={(e) => updateLink(i, j, "to", e.target.value)} placeholder="/path" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i, j)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="outline" onClick={() => addLink(i)}><Plus className="w-4 h-4 me-1" />رابط</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-bold">أيقونات السوشيال ميديا</Label>
            <Button type="button" size="sm" variant="outline" onClick={addSocial}><Plus className="w-4 h-4 me-1" />إضافة</Button>
          </div>
          <div className="space-y-2">
            {(s.footer.socials || []).map((soc: any, i: number) => (
              <div key={i} className="flex gap-2 items-center">
                <select value={soc.platform} onChange={(e) => updateSocial(i, "platform", e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
                  {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <Input value={soc.url || ""} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="https://..." />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSocial(i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={() => save("footer")}>حفظ التذييل</Button>
      </Card>

      {/* ساعات العمل */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">ساعات العمل</h2>
          <Button type="button" size="sm" variant="outline" onClick={() => set("contact", "hours", [...(s.contact.hours || []), { label: "", value: "", highlight: false }])}>
            <Plus className="w-4 h-4 me-1" />إضافة
          </Button>
        </div>
        <div className="space-y-2">
          {(s.contact.hours || []).map((h: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <Input placeholder="اليوم" value={h.label || ""} onChange={(e) => { const arr = [...s.contact.hours]; arr[i] = { ...arr[i], label: e.target.value }; set("contact", "hours", arr); }} />
              <Input placeholder="الوقت" value={h.value || ""} onChange={(e) => { const arr = [...s.contact.hours]; arr[i] = { ...arr[i], value: e.target.value }; set("contact", "hours", arr); }} />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input type="checkbox" checked={!!h.highlight} onChange={(e) => { const arr = [...s.contact.hours]; arr[i] = { ...arr[i], highlight: e.target.checked }; set("contact", "hours", arr); }} /> مميز
              </label>
              <Button type="button" variant="ghost" size="icon" onClick={() => set("contact", "hours", s.contact.hours.filter((_: any, idx: number) => idx !== i))}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
        <Button onClick={() => save("contact")}>حفظ</Button>
      </Card>
    </div>
  );
}
