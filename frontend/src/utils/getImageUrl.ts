/**
 * Builds the full image URL for a backend media path.
 * Handles 3 path formats returned by Django/DRF:
 *  1. Full URL: "http://..." → return as-is
 *  2. Absolute path: "/media/product_images/..." → join to VITE_API_IMG_URL
 *  3. Bare relative path: "product_images/..." → prepend /media/ then join
 */
export const getImageUrl = (
  imagePath: string,
  fallback = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
): string => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith("http")) return imagePath;

  const base =
    (import.meta.env.VITE_API_IMG_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

  // If DRF returned a bare storage path (e.g. "product_images/foo.jpg"),
  // prepend /media/ so the URL becomes http://host/media/product_images/foo.jpg
  const normalised = imagePath.startsWith("/") ? imagePath : `/media/${imagePath}`;

  return `${base}${normalised}`;
};
