import { useEffect, useState } from "react";
import { categoriesApi } from "@/api/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; name: string; slug: string; icon?: string; displayOrder: number; };
const empty: Partial<Category> = { name: "", slug: "", icon: "", displayOrder: 0 };

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Category>>(empty);

  const load = async () => {
    try {
      const data = await categoriesApi.getAll();
      setItems(data || []);
    } catch { toast.error("خطأ في تحميل التصنيفات"); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name || !editing.slug) return toast.error("الاسم والرابط مطلوبان");
    const payload = {
      name: editing.name!,
      slug: editing.slug!,
      icon: editing.icon || "",
      displayOrder: editing.displayOrder || 0,
    };
    try {
      if (editing.id) {
        await categoriesApi.update(editing.id, payload);
        toast.success("تم التحديث");
      } else {
        await categoriesApi.create(payload);
        toast.success("تمت الإضافة");
      }
      setOpen(false); setEditing(empty); load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف التصنيف؟")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">التصنيفات</h1>
          <p className="text-muted-foreground">{items.length} تصنيف</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> تصنيف جديد</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-md">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل تصنيف" : "تصنيف جديد"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الاسم</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>الرابط (slug)</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <Label>أيقونة (إيموجي)</Label>
                <Input value={editing.icon || ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input type="number" value={editing.displayOrder ?? 0} onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })} />
              </div>
            </div>
            <Button onClick={save} className="w-full mt-2">حفظ</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-right p-2">الأيقونة</th>
                <th className="text-right p-2">الاسم</th>
                <th className="text-right p-2">الرابط</th>
                <th className="text-right p-2">الترتيب</th>
                <th className="text-right p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2 text-2xl">{c.icon}</td>
                  <td className="p-2 font-medium">{c.name}</td>
                  <td className="p-2 text-muted-foreground">{c.slug}</td>
                  <td className="p-2">{c.displayOrder}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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