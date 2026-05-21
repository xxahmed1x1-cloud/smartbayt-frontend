export const formatPrice = (n: number) =>
  `${n.toLocaleString("ar-EG")} جنيه`;

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5224";

/**
 * يحوّل المسار الجاي من الـ API لـ URL كامل
 * "/uploads/img.jpg" → "http://localhost:5224/uploads/img.jpg"
 * لو جاي URL كامل يرجعه زي ما هو
 */
export const resolveImageUrl = (path?: string | null): string => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
