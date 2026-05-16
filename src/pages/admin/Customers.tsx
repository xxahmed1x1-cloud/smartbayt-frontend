import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminCustomers() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/api/auth/users").then((res) => {
      setItems(res.data || []);
    }).catch(() => {
      // endpoint مش موجود دلوقتي — هنعرض فاضي
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">العملاء</h1>
        <p className="text-muted-foreground">{items.length} عميل</p>
      </div>
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b">
            <tr>
              <th className="text-right p-2">الاسم</th>
              <th className="text-right p-2">البريد</th>
              <th className="text-right p-2">الدور</th>
              <th className="text-right p-2">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">لا يوجد عملاء بعد</td></tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-2">{u.fullName || "—"}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}