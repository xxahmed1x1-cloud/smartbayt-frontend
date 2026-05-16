import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/api/client";
import { uploadApi } from "@/api/other";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Camera, Lock, Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadApi.upload(file);
      setAvatarUrl(res.url);
      toast.success("تم رفع الصورة");
    } catch { toast.error("خطأ في رفع الصورة"); }
    finally { setUploading(false); }
  };

  const saveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword)
      return toast.error("كلمة المرور الجديدة غير متطابقة");
    if (newPassword && newPassword.length < 6)
      return toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

    setSaving(true);
    try {
      await apiClient.put("/api/auth/profile", {
        fullName,
        avatarUrl: avatarUrl || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // تحديث بيانات اليوزر في localStorage
      const saved = localStorage.getItem("user");
      if (saved) {
        const u = JSON.parse(saved);
        u.fullName = fullName;
        if (avatarUrl) u.avatarUrl = avatarUrl;
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ");
    } finally { setSaving(false); }
  };

  const displayAvatar = avatarUrl || (user as any).avatarUrl;
  const initials = (fullName || user.email).charAt(0).toUpperCase();

  return (
    <main dir="rtl" className="min-h-screen pt-28 pb-16">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold mb-8">الملف الشخصي</h1>

          {/* Avatar */}
          <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> الصورة الشخصية
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-extrabold text-primary-foreground ring-4 ring-primary/20">
                    {initials}
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
              </div>
              <div>
                <p className="font-bold text-lg">{fullName || user.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {(user as any).role === "admin" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold mt-1 inline-block">أدمن</span>
                )}
                {uploading && <p className="text-xs text-muted-foreground mt-1">جاري الرفع...</p>}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> البيانات الشخصية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 block">الاسم الكامل</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">البريد الإلكتروني</label>
                <input value={user.email} disabled
                  className="w-full h-11 px-4 rounded-xl bg-muted border border-border outline-none text-sm text-muted-foreground cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> تغيير كلمة المرور
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 block">كلمة المرور الحالية</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">كلمة المرور الجديدة</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">تأكيد كلمة المرور الجديدة</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm" />
              </div>
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            <Save className="w-5 h-5" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default Profile;