import { useRef, useState } from "react";
import { uploadApi } from "@/api/other";
import { Paperclip, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
}

export default function PublicImageUpload({ value, onChange, label = "إرفاق صورة (اختياري)" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("الرجاء اختيار صورة");
    if (file.size > 10 * 1024 * 1024) return toast.error("الحد الأقصى 10MB");
    setBusy(true);
    try {
      const res = await uploadApi.upload(file);
      onChange(res.url);
      toast.success("تم رفع الصورة");
    } catch { toast.error("فشل الرفع"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="مرفق" className="h-28 rounded-xl border border-border object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => ref.current?.click()}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-dashed border-border hover:border-primary text-sm font-bold transition-colors disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          {label}
        </button>
      )}
    </div>
  );
}