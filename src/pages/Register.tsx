import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const strength = (p: string) => {
  if (p.length < 6) return { label: "ضعيفة", pct: 33, color: "bg-destructive" };
  if (p.length < 10) return { label: "متوسطة", pct: 66, color: "bg-yellow-500" };
  return { label: "قوية", pct: 100, color: "bg-success" };
};

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const s = strength(pwd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return toast.error("يجب الموافقة على الشروط والأحكام");
    if (pwd !== confirmPwd) return toast.error("كلمة المرور غير متطابقة");
    if (pwd.length < 6) return toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

    setIsLoading(true);
    try {
      await signUp(email, pwd, fullName);
      toast.success("تم إنشاء الحساب بنجاح");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
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
        <h1 className="text-2xl font-extrabold text-center mb-6">إنشاء حساب</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold mb-1.5">الاسم الكامل</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">كلمة المرور</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary"
            />
            {pwd && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
                <p className="text-xs mt-1 text-muted-foreground">قوة كلمة المرور: <span className="font-bold">{s.label}</span></p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary"
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="accent-primary mt-1"
            />
            <span>أوافق على <a href="#" className="text-primary">الشروط والأحكام</a> و <a href="#" className="text-primary">سياسة الخصوصية</a></span>
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold disabled:opacity-60"
          >
            {isLoading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          لديك حساب؟ <Link to="/login" className="text-primary font-bold">تسجيل الدخول</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;