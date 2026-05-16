import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Loader2 } from "lucide-react";
import { reviewsApi } from "@/api/other";
import { toast } from "sonner";

interface Props {
  productId?: string;
  onSubmitted?: () => void;
}

const ReviewForm = ({ productId, onSubmitted }: Props) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error("الرجاء اختيار عدد النجوم");
    if (!name.trim()) return toast.error("الاسم مطلوب");
    if (comment.trim().length < 5) return toast.error("الرجاء كتابة رأيك");
    setBusy(true);
    try {
      await reviewsApi.create({
        productId: productId || undefined,
        authorName: name.trim(),
        rating,
        comment: comment.trim(),
      });
      toast.success("شكراً لك! سيظهر تقييمك بعد المراجعة.");
      setRating(0); setName(""); setComment("");
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={submit}
      className="p-5 rounded-2xl bg-surface border border-border space-y-4"
    >
      <h3 className="font-extrabold text-lg">شاركنا رأيك في المنتج</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.button
            key={s} type="button"
            whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)} aria-label={`${s} نجوم`}
          >
            <Star className={`w-7 h-7 transition-colors ${(hover || rating) >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
          </motion.button>
        ))}
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="اسمك" maxLength={60}
        className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        rows={4} maxLength={500} placeholder="اكتب تجربتك مع المنتج..."
        className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        disabled={busy} type="submit"
        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-bold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        إرسال التقييم
      </motion.button>
    </motion.form>
  );
};

export default ReviewForm;