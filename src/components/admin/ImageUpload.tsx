import { useRef, useState } from "react";
import { uploadApi } from "@/api/other";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  previewClassName?: string;
}

export default function ImageUpload({ value, onChange, label = "رفع صورة", previewClassName = "h-24 rounded" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("الرجاء اختيار صورة");
    if (file.size > 10 * 1024 * 1024) return toast.error("حجم الصورة أكبر من 10MB");
    setBusy(true);
    try {
      const res = await uploadApi.upload(file);
      onChange(res.url);
      toast.success("تم رفع الصورة");
    } catch { toast.error("فشل الرفع"); }
    finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className={`${previewClassName} object-cover border`} />
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <Button type="button" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {value ? "استبدال الصورة" : label}
      </Button>
    </div>
  );
}