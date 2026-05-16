import { useEffect, useState } from "react";
import { dashboardApi } from "@/api/other";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [byCat, setByCat] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.get().then((data) => {
      setStats({
        products: data.totalProducts,
        orders: data.totalOrders,
        customers: data.totalCustomers,
        revenue: data.totalRevenue,
      });
      setRecent(data.recentOrders || []);
      setByCat((data.productsByCategory || []).map((c: any) => ({ name: c.category, value: c.count })));
      setSalesData((data.salesByDay || []).map((s: any) => ({ date: s.date, total: s.total })));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "إجمالي المبيعات", value: `${stats.revenue.toLocaleString()} ج.م`, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "الطلبات", value: stats.orders, icon: ShoppingCart, color: "from-blue-500 to-cyan-500" },
    { label: "المنتجات", value: stats.products, icon: Package, color: "from-purple-500 to-pink-500" },
    { label: "العملاء", value: stats.customers, icon: Users, color: "from-orange-500 to-red-500" },
  ];

  const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة المعلومات</h1>
        <p className="text-muted-foreground">نظرة عامة على متجرك</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${c.color}`} />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="text-2xl font-bold mt-1">{c.value}</div>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">المبيعات (آخر 7 أيام)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">المنتجات حسب التصنيف</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" outerRadius={80} label>
                  {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="font-semibold mb-4">آخر الطلبات</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد طلبات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-right p-2">العميل</th>
                  <th className="text-right p-2">المبلغ</th>
                  <th className="text-right p-2">الحالة</th>
                  <th className="text-right p-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="p-2">{o.customerName}</td>
                    <td className="p-2">{Number(o.total).toLocaleString()} ج.م</td>
                    <td className="p-2"><span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{o.status}</span></td>
                    <td className="p-2 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}