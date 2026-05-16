import { useEffect, useState } from "react";
import { jobsApi } from "@/api/other";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Job = { id: string; title: string; department?: string; location?: string; jobType?: string; description: string; requirements?: string; isActive: boolean; };
const empty: Partial<Job> = { title: "", department: "", location: "", jobType: "", description: "", requirements: "", isActive: true };

export default function AdminJobs() {
  const [items, setItems] = useState<Job[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Job>>(empty);

  const load = async () => {
    try {
      const data = await jobsApi.getAll();
      setItems(data || []);
    } catch { toast.error("خطأ في تحميل الوظائف"); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.description) return toast.error("المسمى والوصف مطلوبان");
    const payload = {
      title: editing.title!,
      department: editing.department || "",
      location: editing.location || "",
      jobType: editing.jobType || "",
      description: editing.description!,
      requirements: editing.requirements || "",
      isActive: editing.isActive ?? true,
    };
    try {
      if (editing.id) {
        await jobsApi.update(editing.id, payload);
        toast.success("تم التحديث");
      } else {
        await jobsApi.create(payload);
        toast.success("تمت الإضافة");
      }
      setOpen(false); setEditing(empty); load();
    } catch { toast.error("حدث خطأ"); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الوظيفة؟")) return;
    try {
      await jobsApi.delete(id);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">الوظائف</h1>
          <p className="text-muted-foreground">{items.length} وظيفة</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> وظيفة جديدة</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل وظيفة" : "وظيفة جديدة"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>المسمى الوظيفي</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>القسم</Label>
                  <Input value={editing.department || ""} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
                </div>
                <div>
                  <Label>الموقع</Label>
                  <Input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>نوع الدوام</Label>
                <Input value={editing.jobType || ""} onChange={(e) => setEditing({ ...editing, jobType: e.target.value })} placeholder="دوام كامل / جزئي / عن بعد" />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea rows={4} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>المتطلبات</Label>
                <Textarea rows={3} value={editing.requirements || ""} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="accent-primary" />
                نشط
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
                <th className="text-right p-2">المسمى</th>
                <th className="text-right p-2">القسم</th>
                <th className="text-right p-2">الموقع</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((j) => (
                <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2 font-medium">{j.title}</td>
                  <td className="p-2">{j.department || "—"}</td>
                  <td className="p-2">{j.location || "—"}</td>
                  <td className="p-2">{j.isActive ? "✅" : "⛔"}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(j); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(j.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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