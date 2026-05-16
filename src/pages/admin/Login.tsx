import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const { signIn, user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!email || !password) return toast.error("ادخل البيانات");
    setLoading(true);
    try {
      await signIn(email, password);
      // signIn بيحفظ اليوزر — نتحقق من الـ role
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role !== "admin") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("هذا الحساب ليس لديه صلاحية الأدمن");
          return;
        }
      }
      toast.success("مرحباً بك في لوحة التحكم");
      nav("/admin/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "بيانات خاطئة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-primary/20">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">لوحة تحكم الأدمن</h1>
          <p className="text-sm text-muted-foreground mt-1">دخول مخصص للمسؤولين فقط</p>
        </div>
        {params.get("error") === "unauthorized" && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
            ليس لديك صلاحية الوصول للوحة التحكم
          </div>
        )}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="button" className="w-full" disabled={loading} onClick={handleClick}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تسجيل الدخول"}
          </Button>
        </div>
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">العودة للموقع →</Link>
        </div>
      </Card>
    </div>
  );
}