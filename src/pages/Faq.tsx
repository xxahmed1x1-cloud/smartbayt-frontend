import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqsApi } from "@/api/other";

interface Faq { id: string; question: string; answer: string; }

const FaqPage = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    faqsApi.getAll(true).then((data) => setFaqs(data || [])).catch(() => {});
  }, []);

  return (
    <main dir="rtl" className="min-h-screen pt-28 pb-16">
      <section className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> الدعم
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground">إجابات سريعة على أكثر الأسئلة تكراراً</p>
        </motion.div>

        {faqs.length === 0 && (
          <p className="text-center text-muted-foreground py-12">لا توجد أسئلة شائعة بعد.</p>
        )}

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === f.id;
            return (
              <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="bg-surface border border-border rounded-2xl overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : f.id)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-right hover:bg-background transition-colors">
                  <span className="font-bold">{f.question}</span>
                  <ChevronDown className={`w-5 h-5 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-muted-foreground leading-relaxed whitespace-pre-line">{f.answer}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default FaqPage;