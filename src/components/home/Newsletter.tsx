import { useState } from "react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="container py-12">
      <div className="rounded-3xl bg-gradient-newsletter p-10 md:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="relative max-w-2xl mx-auto text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">ابقَ على اطلاع دائم</h2>
          <p className="opacity-90 mb-8">احصل على أحدث العروض ومنتجات المنزل الذكي</p>
          {done ? (
            <p className="text-lg font-bold">✅ تم الاشتراك! تفقد بريدك الإلكتروني</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                setDone(true);
                toast.success("تم الاشتراك بنجاح");
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="flex-1 h-12 px-4 rounded-xl bg-background/20 border border-white/30 backdrop-blur text-primary-foreground placeholder:text-primary-foreground/70 outline-none focus:border-accent"
              />
              <button className="h-12 px-8 rounded-xl bg-background text-foreground font-bold hover:bg-accent transition-colors">
                اشتراك
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
