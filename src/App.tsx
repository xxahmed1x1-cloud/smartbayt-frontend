import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ScrollTop from "@/components/ui/ScrollTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import NotFound from "./pages/NotFound";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminCoupons from "./pages/admin/Coupons";
import AdminReviews from "./pages/admin/Reviews";
import AdminFaqs from "./pages/admin/Faqs";
import AdminBlog from "./pages/admin/Blog";
import AdminJobs from "./pages/admin/Jobs";
import AdminSettings from "./pages/admin/Settings";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const StoreShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Navbar />}
      <div key={pathname} className="animate-fade-in">{children}</div>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      <ScrollTop />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Sonner position="top-left" dir="rtl" />
                <StoreShell>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="faqs" element={<AdminFaqs />} />
                      <Route path="blog" element={<AdminBlog />} />
                      <Route path="jobs" element={<AdminJobs />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </StoreShell>
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
