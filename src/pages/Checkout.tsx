import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, CreditCard, MapPin, Send, ShieldCheck, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/format";
import { ordersApi } from "@/api/orders";

interface ShippingInfo {
  fullName: string; phone: string; email: string; city: string; address: string; notes?: string;
}
type PaymentMethod = "cod" | "card" | "wallet";
const STEPS = [
  { id: 1, label: "الشحن", icon: MapPin },
  { id: 2, label: "الدفع", icon: CreditCard },
  { id: 3, label: "المراجعة", icon: ShieldCheck },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState<ShippingInfo>({ fullName: "", phone: "", email: "", city: "", address: "", notes: "" });
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  type WalletProvider = "vodafone" | "instapay" | "etisalat" | "orange";
  const [wallet, setWallet] = useState<{ provider: WalletProvider; phone: string; accountName: string; instapayHandle: string; email: string; pin: string; }>({ provider: "vodafone", phone: "", accountName: "", instapayHandle: "", email: "", pin: "" });
  const [otp, setOtp] = useState({ sent: false, code: "", input: "", verified: false, cooldown: 0 });

  useEffect(() => {
    if (otp.cooldown <= 0) return;
    const t = setTimeout(() => setOtp((o) => ({ ...o, cooldown: o.cooldown - 1 })), 1000);
    return () => clearTimeout(t);
  }, [otp.cooldown]);

  useEffect(() => {
    setOtp({ sent: false, code: "", input: "", verified: false, cooldown: 0 });
  }, [wallet.provider, wallet.phone, wallet.instapayHandle]);

  const walletIdentifier = wallet.provider === "instapay" ? wallet.instapayHandle.trim() : wallet.phone;
  const canSendOtp = wallet.provider === "instapay" ? wallet.instapayHandle.trim().length >= 3 : /^01[0-9]{9}$/.test(wallet.phone);

  const sendOtp = () => {
    if (!canSendOtp) { toast.error(wallet.provider === "instapay" ? "أدخل اسم المستخدم على InstaPay أولاً" : "أدخل رقم محفظة صحيح أولاً"); return; }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtp({ sent: true, code, input: "", verified: false, cooldown: 60 });
    toast.success("تم إرسال رمز التحقق", { description: `تم الإرسال إلى ${walletIdentifier}`, duration: 4000 });
  };

  const verifyOtp = () => {
    if (otp.input.length !== 4) return toast.error("أدخل الرمز المكون من 4 أرقام");
    if (otp.input !== otp.code) return toast.error("الرمز غير صحيح");
    setOtp((o) => ({ ...o, verified: true }));
    toast.success("تم التحقق من رقمك بنجاح");
  };

  const shippingFee = useMemo(() => (total > 1000 || total === 0 ? 0 : 50), [total]);
  const grandTotal = total + shippingFee;

  if (items.length === 0 && !submitting) {
    return (
      <main className="container pt-28 pb-16 min-h-screen text-center" dir="rtl">
        <h1 className="text-3xl font-extrabold mb-3">سلتك فارغة</h1>
        <p className="text-muted-foreground mb-6">أضف منتجات لإتمام الشراء.</p>
        <button onClick={() => navigate("/shop")} className="px-7 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold">تصفح المتجر</button>
      </main>
    );
  }

  const validateShipping = () => {
    if (!shipping.fullName.trim()) return "الاسم الكامل مطلوب";
    if (!/^01[0-9]{9}$/.test(shipping.phone)) return "رقم هاتف غير صالح";
    if (!/^\S+@\S+\.\S+$/.test(shipping.email)) return "بريد إلكتروني غير صالح";
    if (!shipping.city.trim()) return "المدينة مطلوبة";
    if (shipping.address.trim().length < 8) return "العنوان قصير جداً";
    return null;
  };

  const validatePayment = () => {
    if (payment === "card") {
      if (card.number.replace(/\s/g, "").length < 16) return "رقم البطاقة غير صحيح";
      if (!card.name.trim()) return "اسم حامل البطاقة مطلوب";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "تاريخ الانتهاء MM/YY";
      if (!/^\d{3,4}$/.test(card.cvc)) return "CVC غير صحيح";
      return null;
    }
    if (payment === "wallet") {
      if (wallet.provider === "instapay") { if (!wallet.instapayHandle.trim() || wallet.instapayHandle.trim().length < 3) return "اسم المستخدم على InstaPay مطلوب"; }
      else { if (!/^01[0-9]{9}$/.test(wallet.phone)) return "رقم المحفظة غير صالح"; }
      if (!wallet.accountName.trim()) return "اسم صاحب الحساب مطلوب";
      if (!/^\S+@\S+\.\S+$/.test(wallet.email)) return "بريد إلكتروني غير صالح";
      if (!otp.sent) return "اضغط «إرسال رمز التحقق» أولاً";
      if (!otp.verified) return "يجب التحقق من رمز التأكيد قبل المتابعة";
      return null;
    }
    return null;
  };

  const next = () => {
    if (step === 1) { const err = validateShipping(); if (err) return toast.error(err); }
    if (step === 2) { const err = validatePayment(); if (err) return toast.error(err); }
    setStep((s) => Math.min(3, s + 1));
  };

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const orderData = await ordersApi.place({
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        shippingAddress: `${shipping.address}، ${shipping.city}`,
        paymentMethod: payment,
        notes: shipping.notes,
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });
      const order = { id: orderData.id, items, shipping, payment, subtotal: total, shippingFee, total: grandTotal, createdAt: orderData.createdAt };
      localStorage.setItem("lastOrder", JSON.stringify(order));
      clear();
      navigate(`/order-confirmation/${orderData.id}`);
    } catch {
      toast.error("حدث خطأ في تأكيد الطلب، حاول مرة أخرى");
      setSubmitting(false);
    }
  };

  return (
    <main className="container pt-28 pb-16 min-h-screen" dir="rtl">
      <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4 rotate-180" /> رجوع
      </button>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">إتمام الشراء</h1>

      <div className="flex items-center justify-between max-w-2xl mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon; const active = step === s.id; const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${done ? "bg-success border-success text-white" : active ? "bg-primary border-primary text-primary-foreground" : "bg-surface border-border text-muted-foreground"}`}>
                  {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-bold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-success" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="bg-surface border border-border rounded-2xl p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold mb-2 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> عنوان الشحن</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="الاسم الكامل" value={shipping.fullName} onChange={(v) => setShipping({ ...shipping, fullName: v })} placeholder="محمد أحمد" />
                    <Field label="رقم الهاتف" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} placeholder="01xxxxxxxxx" type="tel" />
                    <Field label="البريد الإلكتروني" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} placeholder="example@mail.com" type="email" />
                    <Field label="المدينة" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} placeholder="القاهرة" />
                  </div>
                  <Field label="العنوان بالتفصيل" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} placeholder="الشارع، رقم المبنى، الشقة" />
                  <div>
                    <label className="text-sm font-bold mb-1.5 block">ملاحظات (اختياري)</label>
                    <textarea value={shipping.notes} onChange={(e) => setShipping({ ...shipping, notes: e.target.value })} rows={3} placeholder="ملاحظات للتوصيل..." className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> طريقة الدفع</h2>
                  <div className="space-y-3">
                    <PayOption active={payment === "cod"} onClick={() => setPayment("cod")} icon={<Wallet className="w-5 h-5" />} title="الدفع عند الاستلام" desc="ادفع نقداً عند وصول الطلب" />
                    <PayOption active={payment === "card"} onClick={() => setPayment("card")} icon={<CreditCard className="w-5 h-5" />} title="بطاقة ائتمان / مدى" desc="فيزا، ماستركارد، مدى" />
                    <PayOption active={payment === "wallet"} onClick={() => setPayment("wallet")} icon={<Wallet className="w-5 h-5" />} title="محفظة إلكترونية" desc="فودافون كاش، إنستاباي" />
                  </div>
                  {payment === "card" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid md:grid-cols-2 gap-4 pt-2">
                      <div className="md:col-span-2"><Field label="رقم البطاقة" value={card.number} onChange={(v) => setCard({ ...card, number: v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} placeholder="0000 0000 0000 0000" /></div>
                      <Field label="اسم حامل البطاقة" value={card.name} onChange={(v) => setCard({ ...card, name: v })} placeholder="Mohamed Ahmed" />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="MM/YY" value={card.expiry} onChange={(v) => { const d = v.replace(/\D/g, "").slice(0, 4); setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} placeholder="12/27" />
                        <Field label="CVC" value={card.cvc} onChange={(v) => setCard({ ...card, cvc: v.replace(/\D/g, "").slice(0, 4) })} placeholder="123" />
                      </div>
                    </motion.div>
                  )}
                  {payment === "wallet" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-2">
                      <div>
                        <label className="text-sm font-bold mb-1.5 block">مزود المحفظة</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {([{ id: "vodafone", label: "فودافون كاش" }, { id: "etisalat", label: "اتصالات كاش" }, { id: "orange", label: "أورانج كاش" }, { id: "instapay", label: "InstaPay" }] as { id: WalletProvider; label: string }[]).map((p) => (
                            <button key={p.id} type="button" onClick={() => setWallet({ ...wallet, provider: p.id })} className={`h-11 rounded-xl border-2 text-sm font-bold transition-colors ${wallet.provider === p.id ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>{p.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold mb-1.5 block">{wallet.provider === "instapay" ? "اسم المستخدم على InstaPay" : "رقم المحفظة"}</label>
                          <div className="flex gap-2">
                            <input value={wallet.provider === "instapay" ? wallet.instapayHandle : wallet.phone} onChange={(e) => { const v = e.target.value; wallet.provider === "instapay" ? setWallet({ ...wallet, instapayHandle: v.trim() }) : setWallet({ ...wallet, phone: v.replace(/\D/g, "").slice(0, 11) }); }} placeholder={wallet.provider === "instapay" ? "username@instapay" : "01xxxxxxxxx"} type={wallet.provider === "instapay" ? "text" : "tel"} className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
                            <button type="button" onClick={sendOtp} disabled={!canSendOtp || otp.cooldown > 0 || otp.verified} className="shrink-0 inline-flex items-center gap-1 px-3 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
                              <Send className="w-3.5 h-3.5" />{otp.verified ? "تم التحقق" : otp.cooldown > 0 ? `${otp.cooldown}ث` : otp.sent ? "إعادة الإرسال" : "إرسال الكود"}
                            </button>
                          </div>
                        </div>
                        <Field label="اسم صاحب الحساب" value={wallet.accountName} onChange={(v) => setWallet({ ...wallet, accountName: v })} placeholder="محمد أحمد" />
                        <Field label="البريد الإلكتروني" value={wallet.email} onChange={(v) => setWallet({ ...wallet, email: v })} placeholder="example@mail.com" type="email" />
                      </div>
                      {otp.sent && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-background p-4 space-y-3">
                          <label className="text-sm font-bold block">رمز التحقق المرسل إلى {walletIdentifier}</label>
                          <div className="flex gap-2">
                            <input value={otp.input} onChange={(e) => setOtp({ ...otp, input: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="••••" inputMode="numeric" maxLength={4} disabled={otp.verified} className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-surface border border-border focus:border-primary outline-none text-center text-lg tracking-[0.5em] font-bold" />
                            <button type="button" onClick={verifyOtp} disabled={otp.verified || otp.input.length !== 4} className="shrink-0 px-4 h-10 rounded-xl bg-success text-white text-xs font-bold disabled:opacity-50">{otp.verified ? "✓ مُتحقق" : "تأكيد الكود"}</button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-extrabold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> مراجعة الطلب</h2>
                  <div className="rounded-xl border border-border p-4 bg-background">
                    <div className="flex items-center justify-between mb-2"><h3 className="font-bold">عنوان الشحن</h3><button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">تعديل</button></div>
                    <p className="text-sm text-muted-foreground leading-6">{shipping.fullName} — {shipping.phone}<br />{shipping.address}، {shipping.city}<br />{shipping.email}</p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-background">
                    <div className="flex items-center justify-between mb-2"><h3 className="font-bold">طريقة الدفع</h3><button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">تعديل</button></div>
                    <p className="text-sm text-muted-foreground">
                      {payment === "cod" && "الدفع عند الاستلام"}
                      {payment === "card" && `بطاقة تنتهي بـ ${card.number.replace(/\s/g, "").slice(-4)}`}
                      {payment === "wallet" && (wallet.provider === "instapay" ? `InstaPay — ${wallet.instapayHandle}` : `${wallet.provider === "vodafone" ? "فودافون كاش" : wallet.provider === "etisalat" ? "اتصالات كاش" : "أورانج كاش"} — ${wallet.phone}`)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-background">
                    <h3 className="font-bold mb-3">المنتجات ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map((i) => (
                        <div key={i.id} className="flex items-center gap-3">
                          <img src={i.image} alt={i.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0"><p className="text-sm font-bold line-clamp-1">{i.name}</p><p className="text-xs text-muted-foreground">الكمية: {i.quantity}</p></div>
                          <span className="text-sm font-bold">{formatPrice(i.price * i.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 h-12 rounded-xl bg-secondary font-bold hover:bg-secondary/80">السابق</button>}
            {step < 3 ? (
              <button onClick={next} className="flex-1 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold">التالي</button>
            ) : (
              <button onClick={placeOrder} disabled={submitting} className="flex-1 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold disabled:opacity-60">
                {submitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
              </button>
            )}
          </div>
        </div>

        <aside className="bg-surface border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-28">
          <h3 className="font-extrabold text-lg mb-4">ملخص الطلب</h3>
          <div className="space-y-2 text-sm pb-4 border-b border-border">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground line-clamp-1">{i.name} × {i.quantity}</span>
                <span className="font-bold whitespace-nowrap">{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm py-4 border-b border-border">
            <Row label="المجموع الفرعي" value={formatPrice(total)} />
            <Row label="الشحن" value={shippingFee === 0 ? <span className="text-success font-bold">مجاني</span> : formatPrice(shippingFee)} />
          </div>
          <div className="flex justify-between text-lg font-extrabold pt-4">
            <span>الإجمالي</span>
            <span className="text-primary">{formatPrice(grandTotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-success" /> دفع آمن ومشفر</p>
        </aside>
      </div>
    </main>
  );
};

const Field = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; }) => (
  <div>
    <label className="text-sm font-bold mb-1.5 block">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-11 px-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
  </div>
);

const PayOption = ({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; }) => (
  <button type="button" onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-right ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{icon}</div>
    <div className="flex-1"><p className="font-bold">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary" : "border-border"}`}>{active && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}</div>
  </button>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div>
);

export default Checkout;