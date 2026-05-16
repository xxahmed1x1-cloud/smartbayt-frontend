import { useEffect, useState } from "react";
import { productsApi } from "@/api/products";
import { uploadApi } from "@/api/other";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "http://localhost:5224";
const resolveImg = (p?: string | null) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `${BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
};

type Product = {
  id: string; name: string; category: string; price: number; originalPrice: number | null;
  rating: number; reviews: number; badge: string | null; image: string | null;
  images?: string[]; description: string | null; stock: number; isActive: boolean;
};

const empty: Partial<Product> = { name: "", category: "", price: 0, stock: 0, rating: 0, reviews: 0, isActive: true, images: [] };

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(empty);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const load = async () => {
    try {
      const data = await productsApi.getAll({ pageSize: 100 });
      setItems(data.data || []);
    } catch { toast.error("خطأ في تحميل المنتجات"); }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((p) => p.name.includes(search) || p.category.includes(search));

  // رفع الصورة الرئيسية
  const handleMainImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadApi.upload(file);
      setEditing((prev) => ({ ...prev, image: res.url }));
      toast.success("تم رفع الصورة الرئيسية");
    } catch { toast.error("خطأ في رفع الصورة"); }
    finally { setUploading(false); }
  };

  // رفع صورة إضافية
  const handleExtraImage = async (file: File) => {
    const imgs = editing.images || [];
    if (imgs.length >= 4) return toast.error("الحد الأقصى 4 صور إضافية");
    setUploadingExtra(true);
    try {
      const res = await uploadApi.upload(file);
      setEditing((prev) => ({ ...prev, images: [...(prev.images || []), res.url] }));
      toast.success("تمت إضافة الصورة");
    } catch { toast.error("خطأ في رفع الصورة"); }
    finally { setUploadingExtra(false); }
  };

  const removeExtra = (idx: number) =>
    setEditing((prev) => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));

  const save = async () => {
    if (!editing.name || !editing.category) return toast.error("الاسم والتصنيف مطلوبان");
    const payload = {
      name: editing.name!,
      slug: editing.name!.toLowerCase().replace(/\s+/g, "-"),
      category: editing.category!,
      price: editing.price || 0,
      originalPrice: editing.originalPrice || null,
      rating: editing.rating || 0,
      reviews: editing.reviews || 0,
      badge: editing.badge || null,
      image: editing.image || null,
      images: JSON.stringify(editing.images || []),
      description: editing.description || null,
      stock: editing.stock || 0,
      isActive: editing.isActive ?? true,
      features: "[]", specs: "[]",
    };
    try {
      if (editing.id) { await productsApi.update(editing.id, payload); toast.success("تم التحديث"); }
      else { await productsApi.create(payload); toast.success("تمت الإضافة"); }
      setOpen(false); setEditing(empty); load();
    } catch { toast.error("حدث خطأ"); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف المنتج؟")) return;
    try { await productsApi.delete(id); toast.success("تم الحذف"); load(); }
    catch { toast.error("حدث خطأ"); }
  };

  const openEdit = (p: Product) => {
    let imgs: string[] = [];
    try { imgs = typeof p.images === "string" ? JSON.parse(p.images as any) : (p.images || []); } catch {}
    setEditing({ ...p, images: imgs });
    setOpen(true);
  };

  const extraImgs = editing.images || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground">{items.length} منتج</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> منتج جديد</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل منتج" : "منتج جديد"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>اسم المنتج</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>التصنيف</Label>
                <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div>
                <Label>الشارة (تخفيض/جديد)</Label>
                <Input value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} />
              </div>
              <div>
                <Label>السعر</Label>
                <Input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label>السعر الأصلي (قبل الخصم)</Label>
                <Input type="number" value={editing.originalPrice ?? ""} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label>المخزون</Label>
                <Input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
              </div>
              <div>
                <Label>التقييم (0-5)</Label>
                <Input type="number" step="0.1" max={5} value={editing.rating ?? 0} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-2">
                <Label>الوصف</Label>
                <Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              {/* الصورة الرئيسية */}
              <div className="md:col-span-2 p-3 rounded-xl border border-border bg-muted/20">
                <Label className="font-bold mb-1 block">📌 الصورة الرئيسية</Label>
                <p className="text-xs text-muted-foreground mb-2">تظهر في الكروت والقوائم</p>
                <div className="flex items-center gap-3">
                  {editing.image ? (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img src={resolveImg(editing.image)} className="w-full h-full rounded-lg object-cover border border-border" />
                      <button onClick={() => setEditing({ ...editing, image: null })}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground text-center flex-shrink-0">
                      لا صورة
                    </div>
                  )}
                  <div className="flex-1">
                    <Input type="file" accept="image/*" disabled={uploading}
                      onChange={(e) => { if (e.target.files?.[0]) handleMainImage(e.target.files[0]); }} />
                    {uploading && <p className="text-xs text-muted-foreground mt-1">⏳ جاري الرفع...</p>}
                  </div>
                </div>
              </div>

              {/* الصور الإضافية */}
              <div className="md:col-span-2 p-3 rounded-xl border border-border bg-muted/20">
                <Label className="font-bold mb-1 block">🖼️ صور المعرض (حتى 4 صور)</Label>
                <p className="text-xs text-muted-foreground mb-3">تظهر في gallery صفحة المنتج عند الضغط عليها</p>
                <div className="grid grid-cols-4 gap-2">
                  {extraImgs.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={resolveImg(img)} className="w-full h-full rounded-lg object-cover border border-border" />
                      <button onClick={() => removeExtra(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center shadow">
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/60 text-white px-1 rounded">{idx + 1}</span>
                    </div>
                  ))}
                  {extraImgs.length < 4 && (
                    <label className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors
                      ${uploadingExtra ? "opacity-50 pointer-events-none" : "border-border hover:border-primary hover:bg-primary/5"}`}>
                      {uploadingExtra ? <span className="text-xs">⏳</span> : <>
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{extraImgs.length}/4</span>
                      </>}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleExtraImage(e.target.files[0]); }} />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={save} className="w-full mt-2">حفظ</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-right p-2">المنتج</th>
                <th className="text-right p-2">التصنيف</th>
                <th className="text-right p-2">السعر</th>
                <th className="text-right p-2">المخزون</th>
                <th className="text-right p-2">التقييم</th>
                <th className="text-right p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {p.image
                        ? <img src={resolveImg(p.image)} className="w-10 h-10 rounded object-cover" />
                        : <div className="w-10 h-10 rounded bg-muted" />}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">
                    {Number(p.price).toLocaleString()} ج.م
                    {p.originalPrice && <span className="line-through text-xs text-muted-foreground mr-2">{Number(p.originalPrice).toLocaleString()}</span>}
                  </td>
                  <td className="p-2">{p.stock}</td>
                  <td className="p-2">⭐ {p.rating}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}