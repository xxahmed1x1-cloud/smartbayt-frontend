import { useEffect, useState } from "react";
import { reviewsApi } from "@/api/other";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";

export default function AdminReviews() {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      const data = await reviewsApi.getAll();
      setItems(data || []);
    } catch { toast.error("خطأ في تحميل التقييمات"); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try {
      await reviewsApi.approve(id);
      toast.success("تم الاعتماد"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف؟")) return;
    try {
      await reviewsApi.delete(id);
      toast.success("تم الحذف"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">التقييمات</h1></div>
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="text-right p-2">المؤلف</th>
              <th className="text-right p-2">التقييم</th>
              <th className="text-right p-2">التعليق</th>
              <th className="text-right p-2">الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-2">{r.authorName}</td>
                <td className="p-2">{"⭐".repeat(r.rating)}</td>
                <td className="p-2 max-w-md truncate">{r.comment}</td>
                <td className="p-2">{r.approved ? <span className="text-emerald-500">معتمد</span> : <span className="text-amber-500">قيد المراجعة</span>}</td>
                <td className="p-2">
                  <div className="flex gap-1">
                    {!r.approved && <Button variant="ghost" size="icon" onClick={() => approve(r.id)}><Check className="w-4 h-4 text-emerald-500" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}