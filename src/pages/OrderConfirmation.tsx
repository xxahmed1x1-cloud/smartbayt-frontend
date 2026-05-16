import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, MapPin, CreditCard, Home } from "lucide-react";
import { formatPrice } from "@/utils/format";
import { CartItem } from "@/context/CartContext";

interface SavedOrder {
  id: string;
  items: CartItem[];
  shipping: {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
  };
  payment: "cod" | "card" | "wallet";
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}

const paymentLabel: Record<SavedOrder["payment"], string> = {
  cod: "الدفع عند الاستلام",
  card: "بطاقة ائتمان",
  wallet: "محفظة إلكترونية",
};

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastOrder");
      if (raw) {
        const o = JSON.parse(raw) as SavedOrder;
        if (!id || o.id === id) setOrder(o);
      }
    } catch {}
  }, [id]);

  return (
    <main className="container pt-28 pb-16 min-h-screen" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto text-center mb-10"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">تم تأكيد طلبك بنجاح!</h1>
        <p className="text-muted-foreground">
          شكراً لك. سنرسل لك تحديثات الشحن عبر البريد الإلكتروني.
        </p>
        {id && (
          <p className="mt-3 text-sm">
            رقم الطلب: <span className="font-bold text-primary">{id}</span>
          </p>
        )}
      </motion.div>

      {order ? (
        <div className="max-w-3xl mx-auto space-y-4">
          <Section icon={<Package className="w-5 h-5" />} title="المنتجات">
            <div className="space-y-3">
              {order.items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <img src={i.image} alt={i.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm line-clamp-1">{i.name}</p>
                    <p className="text-xs text-muted-foreground">الكمية: {i.quantity}</p>
                  </div>
                  <span className="font-bold text-sm">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
          </Section>

          <div className="grid md:grid-cols-2 gap-4">
            <Section icon={<MapPin className="w-5 h-5" />} title="عنوان الشحن">
              <p className="text-sm leading-7 text-muted-foreground">
                {order.shipping.fullName}
                <br />
                {order.shipping.phone}
                <br />
                {order.shipping.address}، {order.shipping.city}
              </p>
            </Section>
            <Section icon={<CreditCard className="w-5 h-5" />} title="الدفع">
              <p className="text-sm text-muted-foreground">{paymentLabel[order.payment]}</p>
            </Section>
          </div>

          <Section title="الفاتورة">
            <div className="space-y-2 text-sm">
              <Row label="المجموع الفرعي" value={formatPrice(order.subtotal)} />
              <Row
                label="الشحن"
                value={
                  order.shippingFee === 0 ? (
                    <span className="text-success font-bold">مجاني</span>
                  ) : (
                    formatPrice(order.shippingFee)
                  )
                }
              />
              <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-border">
                <span>الإجمالي</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </Section>
        </div>
      ) : (
        <p className="text-center text-muted-foreground">لم يتم العثور على بيانات الطلب.</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold"
        >
          <Home className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-7 h-12 rounded-xl bg-secondary font-bold hover:bg-secondary/80"
        >
          متابعة التسوق
        </Link>
      </div>
    </main>
  );
};

const Section = ({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-surface border border-border rounded-2xl p-5">
    <h3 className="font-extrabold mb-3 flex items-center gap-2">
      {icon && <span className="text-primary">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export default OrderConfirmation;
