import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Star, HelpCircle, FileText, Briefcase, Settings, LogOut, Folder, Store, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "لوحة المعلومات" },
  { to: "/admin/products", icon: Package, label: "المنتجات" },
  { to: "/admin/categories", icon: Folder, label: "التصنيفات" },
  { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
  { to: "/admin/customers", icon: Users, label: "العملاء" },
  { to: "/admin/coupons", icon: Tag, label: "الكوبونات" },
  { to: "/admin/reviews", icon: Star, label: "التقييمات" },
  { to: "/admin/faqs", icon: HelpCircle, label: "الأسئلة الشائعة" },
  { to: "/admin/blog", icon: FileText, label: "المدونة" },
  { to: "/admin/jobs", icon: Briefcase, label: "الوظائف" },
  { to: "/admin/settings", icon: Settings, label: "إعدادات الموقع" },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const nav = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen bg-muted/20 flex">
      <aside className="w-64 bg-card border-l border-border flex flex-col fixed inset-y-0 right-0 z-30">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm">Smart Vibe</div>
              <div className="text-xs text-muted-foreground">لوحة التحكم</div>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 border-b border-border">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ExternalLink className="w-4 h-4" />
            عرض الموقع
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground font-semibold" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 truncate px-2">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); nav("/admin/login"); }}>
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </Button>
        </div>
      </aside>
      <main className="flex-1 mr-64 p-6 lg:p-8 max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}