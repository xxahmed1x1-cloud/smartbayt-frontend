import { useEffect, useState } from "react";
import { couponsApi } from "@/api/other";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string; code: string; discountType: string; discountValue: number;
  maxUses?: number; usedCount: number; expiresAt?: string; isActive: boolean;
};
const empty: Partial<Coupon> = { code: "", discountType: "percent", discountValue: 10, isActive: true };

export default function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Coupon>>(empty);

  const load = async () => {
    try {
      const data = await couponsApi.getAll();
      setItems(data || []);
    } catch { toast.error("خطأ في تحميل الكوبونات"); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.code || !editing.discountValue) return toast.error("الكود والقيمة مطلوبان");
    const payload = {
      code: editing.code!,
      discountType: editing.discountType || "percent",
      discountValue: editing.discountValue!,
      maxUses: editing.maxUses || null,
      expiresAt: editing.expiresAt || null,
      isActive: editing.isActive ?? true,
    };
    try {
      if (editing.id) {
        await couponsApi.update(editing.id, payload);
        toast.success("تم التحديث");
      } else {
        await couponsApi.create(payload);
        toast.success("تمت الإضافة");
      }
      setOpen(false); setEditing(empty); load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الكوبون؟")) return;
    try {
      await couponsApi.delete(id);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">الكوبونات</h1>
          <p className="text-muted-foreground">{items.length} كوبون</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> كوبون جديد</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-md">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل كوبون" : "كوبون جديد"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>كود الكوبون</Label>
                <Input value={editing.code || ""} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label>النوع</Label>
                <select
                  value={editing.discountType || "percent"}
                  onChange={(e) => setEditing({ ...editing, discountType: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                >
                  <option value="percent">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ج.م)</option>
                </select>
              </div>
              <div>
                <Label>قيمة الخصم</Label>
                <Input type="number" value={editing.discountValue ?? 10} onChange={(e) => setEditing({ ...editing, discountValue: Number(e.target.value) })} />
              </div>
              <div>
                <Label>حد أقصى للاستخدام</Label>
                <Input type="number" value={editing.maxUses ?? ""} onChange={(e) => setEditing({ ...editing, maxUses: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <Label>تاريخ الانتهاء</Label>
                <Input type="date" value={editing.expiresAt?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="accent-primary" />
                مفعّل
              </label>
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
                <th className="text-right p-2">الكود</th>
                <th className="text-right p-2">النوع</th>
                <th className="text-right p-2">القيمة</th>
                <th className="text-right p-2">مرات الاستخدام</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2 font-bold">{c.code}</td>
                  <td className="p-2">{c.discountType === "percent" ? "نسبة %" : "مبلغ ثابت"}</td>
                  <td className="p-2">{c.discountValue}{c.discountType === "percent" ? "%" : " ج.م"}</td>
                  <td className="p-2">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="p-2">{c.isActive ? "✅" : "⛔"}</td>
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