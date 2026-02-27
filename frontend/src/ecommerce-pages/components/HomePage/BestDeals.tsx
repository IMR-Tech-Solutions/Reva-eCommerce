import { useState, useEffect } from "react";
import { ShoppingCart, Star } from "lucide-react";

// ── Types ──
type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type DealProduct = {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  discount?: string;
};

// ── Deal ends date — set your target date here ──
const DEAL_END_DATE = new Date("2026-03-15T23:59:59");

// ── Products ──
const dealProducts: DealProduct[] = [
  {
    id: 1,
    name: "DEWALT 1.6 HP, 15 Gallon, Portable",
    image: "/ecommerce-images/product2.jpg",
    rating: 4,
    reviewCount: 1,
    price: 429.00,
    originalPrice: 684.28,
    discount: "-37%",
  },
  {
    id: 2,
    name: "Rol-Air 6-1/2 HP Belt Drive Twin Tank Gas-",
    image: "/ecommerce-images/product3.jpg",
    rating: 0,
    reviewCount: 0,
    price: 1260.00,
  },
  {
    id: 3,
    name: "Hitachi / Metabo 5.5 HP 8-Gallon Gas Powered",
    image: "/ecommerce-images/product5.jpg",
    rating: 0,
    reviewCount: 0,
    price: 1199.00,
  },
  {
    id: 4,
    name: "Duo-Fast Industrial Pneumatic Nailer with",
    image: "/ecommerce-images/product6.jpg",
    rating: 0,
    reviewCount: 0,
    price: 409.99,
    originalPrice: 748.13,
    discount: "-45%",
  },
  {
    id: 5,
    name: "Hitachi / Metabo HPT 16 Gauge Pneumatic Finish",
    image: "/ecommerce-images/product7.jpg",
    rating: 0,
    reviewCount: 0,
    price: 119.00,
    originalPrice: 159.97,
    discount: "-26%",
  },
];

// ── Star Rating ──
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star: number) => (
      <Star
        key={star}
        size={13}
        className={
          star <= rating
            ? "text-[#FFB700] fill-[#FFB700]"
            : "text-gray-300 fill-gray-200"
        }
      />
    ))}
  </div>
);

// ── Countdown Tile ──
const CountTile = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-[#FFB700] text-[#1C1C1E] font-black text-lg md:text-xl min-w-[48px] md:min-w-[56px] px-2 py-1.5 rounded text-center leading-none">
      {String(value).padStart(2, "0")}
    </div>
    <span className="text-[#FFB700] text-[9px] font-bold uppercase tracking-widest mt-1">
      {label}
    </span>
  </div>
);

// ── Colon Separator ──
const Colon = () => (
  <span className="text-[#FFB700] font-black text-xl pb-4 select-none">:</span>
);

// ── Main Component ──
const BestDeals = () => {

  // ── Countdown Logic ──
  const calculateTimeLeft = (): TimeLeft => {
    const diff = DEAL_END_DATE.getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDealOver =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* ══ HEADER — Title + Countdown ══ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">

          {/* Title */}
          <h2 className="text-[#1C1C1E] text-2xl md:text-4xl font-black text-center">
            Best Deals{" "}
            <span className="text-[#FFB700]">Of The Week</span>
          </h2>

          {/* Countdown */}
          {isDealOver ? (
            <span className="text-red-500 font-black text-sm uppercase tracking-widest">
              Deal Ended
            </span>
          ) : (
            <div className="flex items-end gap-2">
              <CountTile value={timeLeft.days}    label="Days"    />
              <Colon />
              <CountTile value={timeLeft.hours}   label="Hour"    />
              <Colon />
              <CountTile value={timeLeft.minutes} label="Minutes" />
              <Colon />
              <CountTile value={timeLeft.seconds} label="Seconds" />
            </div>
          )}
        </div>

        {/* ══ PRODUCT CARDS ══ */}
        <div className="border-2 border-[#FFB700] rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 border-l border-t border-gray-200">
            {dealProducts.map((product: DealProduct) => (
              <div
                key={product.id}
                className="relative flex flex-col border-b border-r border-gray-200 bg-white hover:z-10 hover:shadow-xl transition-shadow duration-200 group"
              >
                {/* Discount Badge */}
                {product.discount && (
                  <span className="absolute top-3 left-3 z-10 bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                    {product.discount}
                  </span>
                )}

                {/* Image */}
                <div className="w-full h-52 flex items-center justify-center p-6 bg-white overflow-hidden">
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
                  <p className="text-[#1C1C1E] text-sm font-semibold leading-snug line-clamp-2 min-h-[40px]">
                    {product.name}
                  </p>

                  {/* Stars */}
                  <StarRating rating={product.rating} />

                  {/* Price */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm line-through">
                        £{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[#FFB700] font-black text-xl leading-tight">
                      £{product.price.toFixed(2)}
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
        </div>

      </div>
    </section>
  );
};

export default BestDeals;
