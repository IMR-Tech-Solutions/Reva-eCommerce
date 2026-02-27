import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Heart } from "lucide-react";

// ── Types ──
type Product = {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: string;
  originalPrice?: string;
  badge?: string;
};

// ── Responsive Hook ──
const useVisibleCount = (): number => {
  const [count, setCount] = useState<number>(5);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCount(5);
      else if (window.innerWidth >= 768) setCount(4);
      else if (window.innerWidth >= 640) setCount(3);
      else setCount(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
};

// ── Products ──
const allProducts: Product[] = [
  {
    id: 1,
    name: "PIP Class 3 Orange Wind Breaker (XL)",
    image: "/ecommerce-images/product1.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£13.00",
    originalPrice: "£25.99",
    badge: "SALE",
  },
  {
    id: 2,
    name: "MTM Hydro PF-22 Professional Foam",
    image: "/ecommerce-images/product2.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£84.99",
  },
  {
    id: 3,
    name: "DEWALT 4 Piece Wood Chisel Set",
    image: "/ecommerce-images/product3.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£35.99",
    originalPrice: "£41.10",
    badge: "SALE",
  },
  {
    id: 4,
    name: "Milwaukee 1-5/8 Ratcheting Pipe Cutter",
    image: "/ecommerce-images/product4.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£57.99",
    originalPrice: "£83.79",
    badge: "SALE",
  },
  {
    id: 5,
    name: "Hitachi / Metabo HPT 16 Gauge Pneumatic Finish",
    image: "/ecommerce-images/product5.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£119.00",
    originalPrice: "£159.78",
    badge: "SALE",
  },
  {
    id: 6,
    name: "ERB Boss Safety Glasses with Gray Frame and Gray",
    image: "/ecommerce-images/product6.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£18.30",
  },
  {
    id: 7,
    name: "Makita 18V LXT Sub-Compact Brushless 2-",
    image: "/ecommerce-images/product7.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£234.99",
    originalPrice: "£462.80",
    badge: "SALE",
  },
  {
    id: 8,
    name: "Klein Tools Electrician's Hybrid Plier Multi-Tool",
    image: "/ecommerce-images/product8.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£50.00",
  },
  {
    id: 9,
    name: "Malco12 Andy Snip Heavy Duty Vinyl Snips",
    image: "/ecommerce-images/product1.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£49.99",
    originalPrice: "£59.82",
    badge: "SALE",
  },
  {
    id: 10,
    name: "Duo-Fast Industrial Pneumatic Nailer with",
    image: "/ecommerce-images/product2.jpg",
    rating: 0,
    reviewCount: 0,
    price: "£409.99",
    originalPrice: "£748.13",
    badge: "SALE",
  },
];

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

// ── Product Card ──
const ProductCard = ({ product }: { product: Product }) => {
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  return (
    <div className="relative flex flex-col border-b border-r border-gray-200 bg-white hover:z-10 hover:shadow-xl transition-all duration-200 group">

      {/* Badge */}
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 bg-[#FFB700] text-[#1C1C1E] text-[11px] font-black uppercase px-2.5 py-1 rounded-sm">
          {product.badge}
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={() => setWishlisted((w) => !w)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
        aria-label="Add to wishlist"
      >
        <Heart
          size={15}
          className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
        />
      </button>

      {/* Image */}
      <div className="w-full h-56 flex items-center justify-center p-6 bg-white overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Info */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">

        {/* Name */}
        <p className="text-[#1C1C1E] text-sm font-semibold leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#FFB700] transition-colors duration-150">
          {product.name}
        </p>

        {/* Stars */}
        <StarRating rating={product.rating} />

        {/* Price */}
        <div className="flex flex-col gap-0.5 mt-1">
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">
              {product.originalPrice}
            </span>
          )}
          <span className="text-[#FFB700] font-black text-xl leading-tight">
            {product.price}
          </span>
        </div>

        {/* Add to Cart */}
        <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-xs uppercase tracking-wide py-3 rounded transition-colors duration-150">
          <ShoppingCart size={14} />
          Add to cart
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
const FeaturedProducts = () => {
  const visibleCount                = useVisibleCount();
  const [startIndex, setStartIndex] = useState<number>(0);

  useEffect(() => {
    setStartIndex(0);
  }, [visibleCount]);

  const totalItems = allProducts.length;
  const maxStart   = totalItems - visibleCount * 2;
  const canPrev    = startIndex > 0;
  const canNext    = startIndex + visibleCount * 2 < totalItems;

  const handlePrev = () => {
    if (canPrev) setStartIndex((p) => Math.max(0, p - visibleCount));
  };
  const handleNext = () => {
    if (canNext) setStartIndex((p) => Math.min(maxStart, p + visibleCount));
  };

  const row1 = allProducts.slice(startIndex, startIndex + visibleCount);
  const row2 = allProducts.slice(startIndex + visibleCount, startIndex + visibleCount * 2);

  const gridCols =
    visibleCount === 5 ? "grid-cols-5" :
    visibleCount === 4 ? "grid-cols-4" :
    visibleCount === 3 ? "grid-cols-3" :
    "grid-cols-2";

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#1C1C1E] text-2xl font-black uppercase tracking-tight">
              Featured <span className="text-[#FFB700]">Products</span>
            </h2>

            {/* Arrows */}
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

          {/* ── 2-Row Grid ── */}
          <div className={`grid ${gridCols} gap-0 border-t border-l border-gray-200`}>
            {/* Row 1 */}
            {row1.map((product: Product) => (
              <ProductCard key={`r1-${product.id}`} product={product} />
            ))}
            {/* Row 2 */}
            {row2.map((product: Product) => (
              <ProductCard key={`r2-${product.id}`} product={product} />
            ))}
          </div>

          {/* ── Page Dots ── */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {Array.from({
              length: Math.ceil(totalItems / (visibleCount * 2)),
            }).map((_: unknown, i: number) => (
              <button
                key={i}
                onClick={() => setStartIndex(i * visibleCount)}
                className={`rounded-full transition-all duration-300 ${
                  Math.floor(startIndex / visibleCount) === i
                    ? "w-5 h-2 bg-[#FFB700]"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
