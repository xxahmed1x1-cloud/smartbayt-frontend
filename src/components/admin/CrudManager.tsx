import { useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "date";
  required?: boolean;
};

interface Props {
  table: string; // يتحول لـ /api/{table}
  title: string;
  fields: Field[];
  defaults?: Record<string, any>;
  columns: { key: string; label: string; render?: (row: any) => ReactNode }[];
}

export default function CrudManager({ table, title, fields, columns, defaults = {} }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(defaults);

  const load = async () => {
    try {
      const res = await apiClient.get(`/api/${table}`);
      setItems(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { toast.error("خطأ في تحميل البيانات"); }
  };

  useEffect(() => { load(); }, [table]);

  const save = async () => {
    for (const f of fields) {
      if (f.required && !editing[f.key]) return toast.error(`${f.label} مطلوب`);
    }
    try {
      if (editing.id) {
        await apiClient.put(`/api/${table}/${editing.id}`, editing);
        toast.success("تم التحديث");
      } else {
        await apiClient.post(`/api/${table}`, editing);
        toast.success("تمت الإضافة");
      }
      setOpen(false); setEditing(defaults); load();
    } catch (err: any) { toast.error(err?.response?.data?.message || "حدث خطأ"); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف؟")) return;
    try {
      await apiClient.delete(`/api/${table}/${id}`);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{items.length} عنصر</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(defaults); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> إضافة</Button></DialogTrigger>
          <DialogContent dir="rtl" className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "تعديل" : "إضافة جديدة"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea rows={4} value={editing[f.key] || ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
                  ) : f.type === "checkbox" ? (
                    <input type="checkbox" className="ml-2" checked={!!editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} />
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "datetime-local" : "text"}
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <Button onClick={save} className="w-full mt-2">حفظ</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>{columns.map((c) => <th key={c.key} className="text-right p-2">{c.label}</th>)}<th></th></tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  {columns.map((c) => <td key={c.key} className="p-2">{c.render ? c.render(row) : String(row[c.key] ?? "")}</td>)}
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(row); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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