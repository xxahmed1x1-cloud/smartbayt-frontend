export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  images?: string[];
  description: string;
  stock: number;
  colors?: { name: string; value: string }[];
  sizes?: string[];
  features?: string[];
  specs?: { key: string; value: string }[];
}

// منتجات فاضية — بتيجي من الـ API
export const products: Product[] = [];

// categories فاضية — بتيجي من الـ API
export const categories: { id: string; name: string; icon: string; count: number }[] = [];

export const megaCategories = [
  { name: "إضاءة ذكية", icon: "💡", links: ["لمبات LED", "شرائط إضاءة", "إضاءة خارجية"] },
  { name: "أمن وحماية", icon: "🛡️", links: ["كاميرات مراقبة", "أقفال ذكية", "حساسات حركة"] },
  { name: "مطبخ ذكي", icon: "🍳", links: ["ماكينات قهوة", "أفران ذكية", "ثلاجات"] },
  { name: "ترفيه ذكي", icon: "🎬", links: ["شاشات ذكية", "أجهزة صوت", "ألعاب VR"] },
];