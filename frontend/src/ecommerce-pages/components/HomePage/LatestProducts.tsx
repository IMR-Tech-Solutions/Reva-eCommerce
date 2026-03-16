import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { getpublicproductsservice } from "../../../services/productservices";
import { ProductData } from "../../../types/types";
import { handleError } from "../../../utils/handleError";

// Utility to handle backend image URLs
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
  const domain = baseUrl.replace("/api/", "");
  return `${domain}${imagePath}`;
};

// ── Responsive Visible Count Hook ──
const useVisibleCount = (): number => {
  const [visibleCount, setVisibleCount] = useState<number>(4);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setVisibleCount(4);
      else if (window.innerWidth >= 640) setVisibleCount(3);
      else setVisibleCount(2);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visibleCount;
};

// No static data needed here anymore

// ── Star Rating ──
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star: number) => (
      <Star
        key={star}
        size={14}
        className={
          star <= rating
            ? "text-[#FFB700] fill-[#FFB700]"
            : "text-gray-300 fill-gray-200"
        }
      />
    ))}
  </div>
);

// ── Component ──
const LatestProducts = () => {
  const visibleCount = useVisibleCount();
  const [startIndex, setStartIndex] = useState<number>(0);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getpublicproductsservice();
        setProducts(data.slice(-8)); // Get the latest 8 products
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  // Reset startIndex when visibleCount changes (resize)
  useEffect(() => {
    setStartIndex(0);
  }, [visibleCount]);

  const canPrev = startIndex > 0;
  const canNext = startIndex + visibleCount < products.length;

  const handlePrev = () => { if (canPrev) setStartIndex((p) => p - 1); };
  const handleNext = () => { if (canNext) setStartIndex((p) => p + 1); };

  const visibleProducts = products.slice(startIndex, startIndex + visibleCount);

  if (loading) return null;
  if (products.length === 0) return null;

  // Dynamic grid class
  const gridCols =
    visibleCount === 4 ? "grid-cols-4" :
      visibleCount === 3 ? "grid-cols-3" :
        "grid-cols-2";

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#1C1C1E] text-2xl font-black uppercase tracking-tight">
              Latest <span className="text-[#FFB700]">Products</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className={`w-9 h-9 border rounded flex items-center justify-center transition-all duration-150
                  ${canPrev
                    ? "border-gray-300 text-gray-600 hover:bg-[#FFB700] hover:border-[#FFB700] hover:text-[#1C1C1E]"
                    : "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  }`}
                aria-label="Previous"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                onClick={handleNext}
                disabled={!canNext}
                className={`w-9 h-9 border rounded flex items-center justify-center transition-all duration-150
                  ${canNext
                    ? "border-gray-300 text-gray-600 hover:bg-[#FFB700] hover:border-[#FFB700] hover:text-[#1C1C1E]"
                    : "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  }`}
                aria-label="Next"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* ── Product Cards Grid ── */}
          <div className={`grid ${gridCols} gap-0 border-t border-l border-gray-200`}>
            {visibleProducts.map((product: ProductData) => (
              <div
                key={product.id}
                className="relative flex flex-col border-b border-r border-gray-200 bg-white hover:z-10 hover:shadow-xl transition-shadow duration-200 group"
              >
                {/* Badge */}
                {/* No badge for now */}

                {/* Image */}
                <div className="w-full h-56 flex items-center justify-center p-6 bg-white overflow-hidden">
                  <img
                    src={getImageUrl(product.product_image)}
                    alt={product.product_name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200" />

                {/* Info */}
                <div className="flex flex-col gap-2.5 p-4 flex-1">

                  {/* Name */}
                  <p className="text-[#1C1C1E] text-sm font-semibold leading-snug line-clamp-2 min-h-[40px]">
                    {product.product_name}
                  </p>

                  {/* Stars */}
                  <StarRating rating={4} />

                  {/* Price */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-[#FFB700] font-black text-xl leading-tight">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Add to Cart */}
                  <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-xs uppercase tracking-wide py-3 rounded transition-colors duration-150">
                    <ShoppingCart size={14} />
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Dot Indicators ── */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {products.map((_: ProductData, index: number) => {
              const maxStart = products.length - visibleCount;
              return (
                <button
                  key={index}
                  onClick={() => setStartIndex(Math.min(index, maxStart))}
                  className={`rounded-full transition-all duration-300 ${index >= startIndex && index < startIndex + visibleCount
                    ? "w-5 h-2 bg-[#FFB700]"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to product ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* ══ PROMO BANNER ══ */}
        <div className="relative rounded-xl overflow-hidden bg-[#1C1C1E] min-h-[200px] flex items-center px-8 md:px-16">

          {/* BG Image */}
          <div
            className="absolute inset-0 bg-cover bg-right opacity-40"
            style={{ backgroundImage: "url('/ecommerce-images/slide1.jpg')" }}
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1E]/90 via-[#1C1C1E]/50 to-transparent" />

          {/* Text */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <span className="text-white font-black text-5xl md:text-6xl uppercase leading-none tracking-tight">
              EARN
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[#FFB700] font-black text-2xl md:text-3xl uppercase leading-tight">
                $10 Gift Cart
              </span>
              <span className="text-gray-300 text-sm font-semibold uppercase tracking-widest">
                Special Offer for Power Tools
              </span>
            </div>
          </div>

          {/* CTA */}
          <button className="relative z-10 flex-shrink-0 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-base uppercase tracking-wide px-8 py-4 rounded-lg transition-colors duration-200 whitespace-nowrap shadow-lg">
            Shop now →
          </button>
        </div>

      </div>
    </section>
  );
};

export default LatestProducts;
