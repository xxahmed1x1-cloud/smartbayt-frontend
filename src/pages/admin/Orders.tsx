import { useEffect, useState } from "react";
import { ordersApi } from "@/api/orders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await ordersApi.getAll({ pageSize: 100 });
      setOrders(data.data || []);
    } catch { toast.error("خطأ في تحميل الطلبات"); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success("تم تحديث الحالة"); load();
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الطلبات</h1>
        <p className="text-muted-foreground">{orders.length} طلب</p>
      </div>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-right p-2">العميل</th>
                <th className="text-right p-2">الهاتف</th>
                <th className="text-right p-2">المجموع</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2">التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.id} className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="p-2 font-medium">{o.customerName}</td>
                    <td className="p-2">{o.customerPhone || "—"}</td>
                    <td className="p-2">{Number(o.total).toLocaleString()} ج.م</td>
                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td className="p-2"><Button size="sm" variant="ghost">{expanded === o.id ? "▲" : "▼"}</Button></td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={o.id + "-detail"}>
                      <td colSpan={6} className="p-4 bg-muted/20">
                        <div className="text-sm space-y-1 mb-3">
                          <div><b>البريد:</b> {o.customerEmail || "—"}</div>
                          <div><b>العنوان:</b> {o.shippingAddress || "—"}</div>
                          <div><b>طريقة الدفع:</b> {o.paymentMethod || "—"}</div>
                          {o.notes && <div><b>ملاحظات:</b> {o.notes}</div>}
                        </div>
                        <div className="font-semibold mb-2">المنتجات:</div>
                        <ul className="text-sm space-y-1">
                          {(o.items || []).map((it: any) => (
                            <li key={it.id}>{it.productName} × {it.quantity} — {Number(it.price).toLocaleString()} ج.م</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}