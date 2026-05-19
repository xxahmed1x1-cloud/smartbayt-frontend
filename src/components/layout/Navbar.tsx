import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Menu, Moon, Search, ShoppingCart, Sun, User, X, Zap, LogOut, Settings, Package } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { categoriesApi } from "@/api/categories";
import SearchModal from "@/components/search/SearchModal";

const DEFAULT_ICON = "📦";
const ICON_MAP: Record<string, string> = {
  "إضاءة": "💡", "إضاءة ذكية": "💡",
  "أمن": "🛡️", "أمن وحماية": "🛡️", "حماية": "🛡️",
  "مطبخ": "🍳", "مطبخ ذكي": "🍳",
  "ترفيه": "🎬", "ترفيه ذكي": "🎬",
  "صوت": "🔊", "موسيقى": "🎵",
  "شبكات": "📡", "واي فاي": "📡",
  "طاقة": "⚡", "شحن": "🔋",
  "أجهزة": "📱", "موبايل": "📱",
};

const getIcon = (name: string, icon?: string) => {
  if (icon && icon.trim()) return icon;
  for (const key of Object.keys(ICON_MAP)) {
    if (name.includes(key)) return ICON_MAP[key];
  }
  return DEFAULT_ICON;
};

interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  displayOrder?: number;
}

const Navbar = () => {
  const { theme, toggle } = useTheme();
  const { count, setOpen: setCartOpen } = useCart();
  const { ids } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    categoriesApi.getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { to: "/shop", label: "المتجر" },
    { to: "#categories", label: "التصنيفات", isMega: true },
    { to: "/about", label: "من نحن" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-surface/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform ring-2 ring-primary/30">
              <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </span>
            <span className="font-extrabold text-xl tracking-tight">
              Smart <span className="text-primary">Vibe</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) =>
              l.isMega ? (
                <button key={l.label} onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}
                  className="text-sm font-semibold hover:text-primary transition-colors relative">
                  {l.label}
                </button>
              ) : (
                <Link key={l.label} to={l.to} onMouseEnter={() => setMegaOpen(false)} onClick={() => setMegaOpen(false)}
                  className="text-sm font-semibold hover:text-primary transition-colors">
                  {l.label}
                </Link>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <IconBtn onClick={() => setSearchOpen(true)} aria-label="بحث"><Search className="w-5 h-5" /></IconBtn>
            <IconBtn onClick={() => navigate("/wishlist")} aria-label="المفضلة">
              <Heart className="w-5 h-5" />
              {ids.length > 0 && <Badge>{ids.length}</Badge>}
            </IconBtn>
            <IconBtn onClick={() => setCartOpen(true)} aria-label="السلة">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && <Badge>{count}</Badge>}
            </IconBtn>

            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => user ? setUserMenuOpen(!userMenuOpen) : navigate("/login")}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors overflow-hidden"
                aria-label="حسابي"
              >
                {user ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-12 w-64 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                    dir="rtl"
                  >
                    <div className="p-4 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{user.fullName || "المستخدم"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold mt-1 inline-block">أدمن</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      {isAdmin && (
                        <button onClick={() => { navigate("/admin"); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-right text-sm font-semibold">
                          <Settings className="w-4 h-4 text-primary" /> لوحة التحكم
                        </button>
                      )}
                      <button onClick={() => { navigate("/profile"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-right text-sm font-semibold">
                        <Package className="w-4 h-4 text-muted-foreground" /> معلومات الحساب
                      </button>
                      <div className="border-t border-border mt-2 pt-2">
                        <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-right text-sm font-semibold text-destructive">
                          <LogOut className="w-4 h-4" /> تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <IconBtn onClick={toggle} aria-label="تبديل الوضع">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </IconBtn>
            <IconBtn onClick={() => setMobileOpen(true)} aria-label="القائمة" className="md:hidden">
              <Menu className="w-5 h-5" />
            </IconBtn>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <motion.div onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }} className="absolute inset-x-0 top-full">
              <div className="container py-6">
                <div className="relative rounded-3xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                  <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
                    {categories.length === 0 ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="rounded-2xl p-4 bg-background/60 border border-transparent animate-pulse">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl bg-muted" />
                            <div className="h-4 w-24 bg-muted rounded" />
                          </div>
                        </div>
                      ))
                    ) : (
                      categories.map((c, idx) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          className="group relative rounded-2xl p-4 bg-background/60 hover:bg-background border border-transparent hover:border-primary/40 hover:shadow-glow transition-all">
                          <Link to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-3 mb-2">
                            <span className="w-11 h-11 rounded-xl bg-gradient-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                              {getIcon(c.name, c.icon)}
                            </span>
                            <span className="font-extrabold">{c.name}</span>
                          </Link>
                          <Link to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group/link mt-2">
                            <ArrowLeft className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                            عرض المنتجات
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </div>
                  <Link to="/shop" onClick={() => setMegaOpen(false)}
                    className="relative flex items-center justify-center gap-2 py-3 bg-gradient-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
                    استعرض كل المنتجات <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl md:hidden">
            <div className="container flex flex-col h-full pt-6">
              <div className="flex justify-between items-center mb-12">
                <span className="font-extrabold text-xl">Smart <span className="text-primary">Vibe</span></span>
                <button onClick={() => setMobileOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
              </div>
              {user && (
                <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-surface border border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{user.fullName || "المستخدم"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              <nav className="flex flex-col gap-4 text-xl font-bold">
                {links.map((l) => (
                  <Link key={l.label} to={l.to.startsWith("#") ? "/" : l.to} onClick={() => setMobileOpen(false)}>{l.label}</Link>
                ))}
                {categories.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm text-muted-foreground font-semibold">التصنيفات</p>
                    {categories.map((c) => (
                      <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-primary transition-colors">
                        <span>{getIcon(c.name, c.icon)}</span>
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}>المفضلة</Link>
                {user ? (
                  <>
                    {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}>لوحة التحكم</Link>}
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-right text-destructive">تسجيل الخروج</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>تسجيل الدخول</Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

const IconBtn = ({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...rest} className={`relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors ${className}`}>
    {children}
  </button>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
    {children}
  </span>
);

export default Navbar;
