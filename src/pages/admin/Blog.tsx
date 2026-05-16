import { useEffect, useState } from "react";
import { blogApi } from "@/api/other";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type BlogPost = { id: string; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; author?: string; isPublished: boolean; };
const empty: Partial<BlogPost> = { title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "", isPublished: false };

export default function AdminBlog() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<BlogPost>>(empty);

  const load = async () => {
    try {
      const data = await blogApi.getAll();
      setItems(data || []);
    } catch { toast.error("خطأ في تحميل المقالات"); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.content) return toast.error("العنوان والمحتوى مطلوبان");
    const payload = {
      title: editing.title!,
      slug: editing.slug || editing.title!.toLowerCase().replace(/\s+/g, "-"),
      excerpt: editing.excerpt || "",
      content: editing.content!,
      coverImage: editing.coverImage || "",
      author: editing.author || "",
      isPublished: editing.isPublished ?? false,
    };
    try {
      if (editing.id) {
        await blogApi.update(editing.id, payload);
        toast.success("تم التحديث");
      } else {
        await blogApi.create(payload);
        toast.success("تمت الإضافة");
      }
      setOpen(false); setEditing(empty); load();
    } catch { toast.error("حدث خطأ"); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف المقال؟")) return;
    try {
      await blogApi.delete(id);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">المدونة</h1>
          <p className="text-muted-foreground">{items.length} مقال</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(empty); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> مقال جديد</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل مقال" : "مقال جديد"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>العنوان</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>الرابط (slug)</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <Label>مقتطف</Label>
                <Input value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </div>
              <div>
                <Label>المحتوى</Label>
                <Textarea rows={6} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </div>
              <div>
                <Label>صورة الغلاف (رابط)</Label>
                <Input value={editing.coverImage || ""} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} />
              </div>
              <div>
                <Label>الكاتب</Label>
                <Input value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished ?? false} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="accent-primary" />
                منشور
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
                <th className="text-right p-2">العنوان</th>
                <th className="text-right p-2">الكاتب</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2 font-medium">{b.title}</td>
                  <td className="p-2">{b.author || "—"}</td>
                  <td className="p-2">{b.isPublished ? <span className="text-emerald-500">منشور</span> : <span className="text-amber-500">مسودة</span>}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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