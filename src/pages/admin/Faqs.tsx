import { useEffect, useState } from "react";
import { faqsApi } from "@/api/other";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Faq = { id: string; question: string; answer: string; displayOrder: number; isActive: boolean; };
const empty: Partial<Faq> = { question: "", answer: "", displayOrder: 0, isActive: true };

export default function AdminFaqs() {
  const [items, setItems] = useState<Faq[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Faq>>(empty);

  const load = async () => {
    try {
      const data = await faqsApi.getAll();
      setItems(data || []);
    } catch { toast.error("خطأ في تحميل الأسئلة"); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.question || !editing.answer) return toast.error("السؤال والإجابة مطلوبان");
    const payload = {
      question: editing.question!,
      answer: editing.answer!,
      displayOrder: editing.displayOrder || 0,
      isActive: editing.isActive ?? true,
    };
    try {
      if (editing.id) {
        await faqsApi.update(editing.id, payload);
        toast.success("تم التحديث");
      } else {
        await faqsApi.create(payload);
        toast.success("تمت الإضافة");
      }
      setOpen(false); setEditing(empty); load();
    } catch { toast.error("حدث خطأ"); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف السؤال؟")) return;
    try {
      await faqsApi.delete(id);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground">{items.length} سؤال</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> سؤال جديد</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-lg">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل سؤال" : "سؤال جديد"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>السؤال</Label>
                <Input value={editing.question || ""} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
              </div>
              <div>
                <Label>الإجابة</Label>
                <Textarea rows={4} value={editing.answer || ""} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
              </div>
              <div>
                <Label>الترتيب</Label>
                <Input type="number" value={editing.displayOrder ?? 0} onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })} />
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
                <th className="text-right p-2">السؤال</th>
                <th className="text-right p-2">الترتيب</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2 font-medium max-w-sm truncate">{f.question}</td>
                  <td className="p-2">{f.displayOrder}</td>
                  <td className="p-2">{f.isActive ? "✅" : "⛔"}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(f); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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