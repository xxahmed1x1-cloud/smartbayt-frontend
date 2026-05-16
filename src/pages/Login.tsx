import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!email || !password) return toast.error("ادخل الإيميل وكلمة المرور");
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "بيانات خاطئة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-gradient-hero">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-surface border border-border shadow-elegant">
        <Link to="/" className="flex flex-col items-center gap-3 mb-6">
          <span className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Zap className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
          </span>
          <span className="font-extrabold text-xl">سمارت فايب</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-center mb-6">تسجيل الدخول</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary" /> تذكرني
            </label>
            <a href="#" className="text-primary font-semibold">نسيت كلمة المرور؟</a>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClick}
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold disabled:opacity-60"
          >
            {isLoading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          ليس لديك حساب؟ <Link to="/register" className="text-primary font-bold">إنشاء حساب</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;