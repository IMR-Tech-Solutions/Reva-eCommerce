import { useState } from "react";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";

// ── Types ──
type PromoBanner = {
  id: number;
  from: string;
  price: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

type Product = {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: string;
  originalPrice?: string;
  discount?: string;
  hasOptions?: boolean;
};

type TabData = {
  label: string;
  products: Product[];
};

// ── Promo Banners ──
const promoBanners: PromoBanner[] = [
  {
    id: 1,
    from: "From",
    price: "$140",
    title: "HOT DEALS",
    subtitle: "POWER TOOLS",
    image: "/ecommerce-images/banner_image2.jpg",
    href: "/hot-deals",
  },
  {
    id: 2,
    from: "From",
    price: "$540",
    title: "MEGASALE",
    subtitle: "ELECTRIC SAWS",
    image: "/ecommerce-images/banner_image1.jpg",
    href: "/megasale",
  },
];

// ── Tab Products ──
const tabData: TabData[] = [
  {
    label: "Cordless Tools",
    products: [
      {
        id: 1,
        name: "DEWALT 20V MAX Drill / Driver and Impact 2-Tool",
        image: "/ecommerce-images/product1.jpg",
        rating: 0,
        reviewCount: 0,
        price: "£193.99",
        originalPrice: "£363.99",
        discount: "-47%",
      },
      {
        id: 2,
        name: "DEWALT 60V Max FlexVolt 4-1/2 to 6 Angle",
        image: "/ecommerce-images/product2.jpg",
        rating: 0,
        reviewCount: 0,
        price: "£199.00",
        originalPrice: "£352.57",
        discount: "-44%",
      },
      {
        id: 3,
        name: "Milwaukee M18 18V Cordless Compact 1/2",
        image: "/ecommerce-images/product3.jpg",
        rating: 0,
        reviewCount: 0,
        price: "£185.99",
        originalPrice: "£340.00",
        discount: "-45%",
      },
      {
        id: 4,
        name: "Makita 18V LXT Sub-Compact Brushless 2-",
        image: "/ecommerce-images/product4.jpg",
        rating: 0,
        reviewCount: 0,
        price: "£234.99",
        originalPrice: "£462.00",
        discount: "-49%",
      },
      {
        id: 5,
        name: "Milwaukee M12 12V Lithium-Ion Sub-Compact",
        image: "/ecommerce-images/product5.jpg",
        rating: 4,
        reviewCount: 4,
        price: "£185.99 – £230.99",
        originalPrice: "£352.57",
        discount: "-33%",
        hasOptions: true,
      },
    ],
  },
  {
    label: "Hand Tools",
    products: [
      {
        id: 6,
        name: "Stanley FatMax Pro Hammer 20oz",
        image: "/ecommerce-images/product6.jpg",
        rating: 5,
        reviewCount: 8,
        price: "£34.99",
        originalPrice: "£49.99",
        discount: "-30%",
      },
      {
        id: 7,
        name: "Dewalt Ratchet Screwdriver Set 18 Piece",
        image: "/ecommerce-images/product7.jpg",
        rating: 4,
        reviewCount: 3,
        price: "£24.99",
        originalPrice: "£39.99",
        discount: "-38%",
      },
      {
        id: 8,
        name: "Milwaukee Pliers Set 6 Piece Heavy Duty",
        image: "/ecommerce-images/product8.jpg",
        rating: 3,
        reviewCount: 2,
        price: "£59.99",
        originalPrice: "£89.99",
        discount: "-33%",
      },
      {
        id: 9,
        name: "Bosch Professional Tape Measure 10m",
        image: "/ecommerce-images/product1.jpg",
        rating: 5,
        reviewCount: 12,
        price: "£14.99",
        originalPrice: "£22.99",
        discount: "-35%",
      },
      {
        id: 10,
        name: "Makita Combination Spanner Set 12 Piece",
        image: "/ecommerce-images/product2.jpg",
        rating: 4,
        reviewCount: 6,
        price: "£44.99",
        originalPrice: "£64.99",
        discount: "-31%",
      },
    ],
  },
  {
    label: "Air Tools",
    products: [
      {
        id: 11,
        name: "Ingersoll Rand 2235TiMAX 1/2 Air Impact",
        image: "/ecommerce-images/product3.jpg",
        rating: 5,
        reviewCount: 20,
        price: "£189.99",
        originalPrice: "£299.99",
        discount: "-37%",
      },
      {
        id: 12,
        name: "Chicago Pneumatic CP7748 3/8 Air Ratchet",
        image: "/ecommerce-images/product4.jpg",
        rating: 4,
        reviewCount: 7,
        price: "£79.99",
        originalPrice: "£119.99",
        discount: "-33%",
      },
      {
        id: 13,
        name: "Dewalt DWMT74733 1/2 Air Hammer Kit",
        image: "/ecommerce-images/product5.jpg",
        rating: 3,
        reviewCount: 4,
        price: "£109.99",
        originalPrice: "£159.99",
        discount: "-31%",
      },
      {
        id: 14,
        name: "Makita AN923 3-1/2 Framing Nailer Air",
        image: "/ecommerce-images/product6.jpg",
        rating: 4,
        reviewCount: 9,
        price: "£249.99",
        originalPrice: "£399.99",
        discount: "-38%",
      },
      {
        id: 15,
        name: "Milwaukee M12 Inflator Compact Air Tool",
        image: "/ecommerce-images/product7.jpg",
        rating: 5,
        reviewCount: 15,
        price: "£64.99",
        originalPrice: "£99.99",
        discount: "-35%",
      },
    ],
  },
];

// ── Star Rating ──
const StarRating = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1">
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
    {count > 0 && <span className="text-gray-400 text-xs">{count}</span>}
  </div>
);

// ── Main Component ──
const PromoAndBestSellers = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const activeProducts = tabData[activeTab].products;

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* ══════════════════════════════
            PROMO BANNERS — 2 col
        ══════════════════════════════ */}

        {/* ══════════════════════════════
            TOP 5 BEST SELLERS
        ══════════════════════════════ */}
        <div className="flex flex-col gap-5">
          {/* ── Section Title ── */}
          <h2 className="text-[#1C1C1E] text-2xl md:text-3xl font-black text-center">
            Top 5 <span className="text-[#FFB700]">Best Sellers In:</span>
          </h2>

          {/* ── Tabs ── */}
          <div className="flex items-center justify-center border-b border-gray-300">
            {tabData.map((tab: TabData, index: number) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 border-b-2 -mb-px whitespace-nowrap
                  ${
                    activeTab === index
                      ? "text-[#FFB700] border-[#FFB700]"
                      : "text-[#1C1C1E] border-transparent hover:text-[#FFB700] hover:border-[#FFB700]/40"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Product Cards ── */}
          <div className="border-2 border-[#FFB700] rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 border-l border-t border-gray-200">
              {activeProducts.map((product: Product) => (
                <div
                  key={product.id}
                  className="relative flex flex-col border-b border-r border-gray-200 bg-white hover:z-10 hover:shadow-xl transition-all duration-200 group"
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
                    <StarRating
                      rating={product.rating}
                      count={product.reviewCount}
                    />

                    {/* Price */}
                    <div className="flex flex-col gap-0.5 mt-1">
                      {product.originalPrice && (
                        <span className="text-gray-400 text-sm line-through">
                          {product.originalPrice}
                        </span>
                      )}
                      <span className="text-[#FFB700] font-black text-lg leading-tight">
                        {product.price}
                      </span>
                    </div>

                    {/* Button */}
                    {product.hasOptions ? (
                      <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white font-black text-xs uppercase tracking-wide py-3 rounded transition-colors duration-150">
                        Select options
                      </button>
                    ) : (
                      <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-xs uppercase tracking-wide py-3 rounded transition-colors duration-150">
                        <ShoppingCart size={14} />
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promoBanners.map((banner: PromoBanner) => (
            <a
              key={banner.id}
              href={banner.href}
              className="relative overflow-hidden rounded-xl group block min-h-[200px] md:min-h-[240px]"
            >
              {/* BG Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${banner.image})` }}
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1E]/85 via-[#1C1C1E]/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-8 min-h-[200px] md:min-h-[240px]">
                <div className="flex flex-col gap-1">
                  {/* From $xxx */}
                  <p className="text-white text-sm font-medium">
                    {banner.from}{" "}
                    <span className="text-[#FFB700] font-black">
                      {banner.price}
                    </span>
                  </p>

                  {/* Main Title */}
                  <h3 className="text-[#FFB700] font-black text-3xl md:text-4xl uppercase leading-tight tracking-tight">
                    {banner.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-white font-black text-lg md:text-xl uppercase tracking-wide">
                    {banner.subtitle}
                  </p>
                </div>

                {/* Shop Now Button */}
                <button className="mt-6 inline-flex items-center gap-2 bg-white hover:bg-[#FFB700] text-[#1C1C1E] font-black text-sm px-5 py-2.5 rounded transition-all duration-200 w-fit group-hover:gap-3">
                  Shop now
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoAndBestSellers;
