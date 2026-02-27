import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

// ── Types ──
type PromoBanner = {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  highlight: string;
  image: string;
  cta: string;
  bg: string;
};

type Category = {
  id: number;
  label: string;
  image: string;
  href: string;
};

// ── Data ──
const promoBanners: PromoBanner[] = [
  {
    id: 1,
    tag: "NEW BRAND",
    tagColor: "bg-[#FFB700] text-[#1C1C1E]",
    title: "BAUMAX",
    subtitle: "Professional Tools",
    highlight: "",
    image: "/ecommerce-images/banner_1_img.png",
    cta: "Shop now",
    bg: "bg-[#1C1C1E]",
  },
  {
    id: 2,
    tag: "NEW STOCK",
    tagColor: "bg-green-500 text-white",
    title: "BOSCH",
    subtitle: "POWER PACK",
    highlight: "",
    image: "/ecommerce-images/banner_2_img.png",
    cta: "Shop now",
    bg: "bg-[#2C2C2E]",
  },
  {
    id: 3,
    tag: "ENDS 27/08",
    tagColor: "bg-red-500 text-white",
    title: "NOW: $142.99",
    subtitle: "",
    highlight: "GET THE BEST 30% OFF",
    image: "/ecommerce-images/banner_3_img.png",
    cta: "Shop now",
    bg: "bg-[#FFB700]",
  },
];

const categories: Category[] = [
  { id: 1,  label: "Pressure Washers",     image: "/ecommerce-images/cat1.jpg",  href: "/category/pressure-washers" },
  { id: 2,  label: "Cordless Tools",       image: "/ecommerce-images/cat2.jpg",  href: "/category/cordless-tools" },
  { id: 3,  label: "Air Tools",            image: "/ecommerce-images/cat3.jpg",  href: "/category/air-tools" },
  { id: 4,  label: "Blades",               image: "/ecommerce-images/cat4.jpg",  href: "/category/blades" },
  { id: 5,  label: "Nailers",              image: "/ecommerce-images/cat5.jpg",  href: "/category/nailers" },
  { id: 6,  label: "Staple Guns",          image: "/ecommerce-images/cat6.jpg",  href: "/category/staple-guns" },
  { id: 7,  label: "Cutting Tools",        image: "/ecommerce-images/cat7.jpg",  href: "/category/cutting-tools" },
   { id: 8, label: "Electric Power Tools", image: "/ecommerce-images/cat8.jpg", href: "/category/electric-power-tools" },
];

const categoryOptions: string[] = [
  "All Categories", "Pressure Washers", "Cordless Tools",
  "Air Tools", "Blades", "Nailers", "Staple Guns",
  "Cutting Tools", "Bits", "Safety Equipment",
  "Abrasives", "Fall Protection", "Electric Power Tools",
];

const brandOptions: string[] = [
  "All Brands", "Bosch", "Baumax", "Makita",
  "DeWalt", "Milwaukee", "Ryobi", "Hitachi",
];

const FeaturedSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedBrand, setSelectedBrand]         = useState<string>("All Brands");
  const [sku, setSku]                             = useState<string>("");

  const handleShopNow = () => {
    console.log({ selectedCategory, selectedBrand, sku });
    // hook up your router/filter logic here
  };

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* ══════════════════════════════════
            SELECT YOUR PRODUCT BAR
        ══════════════════════════════════ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col sm:flex-row items-center gap-4">

          {/* Label */}
          <div className="flex-shrink-0 text-left">
            <p className="text-[#1C1C1E] text-xs font-bold uppercase tracking-widest leading-tight">
              Select Your
            </p>
            <p className="text-[#1C1C1E] text-xl font-black uppercase leading-tight tracking-tight">
              Product
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-gray-200 flex-shrink-0" />

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 w-full">

            {/* Category Dropdown */}
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedCategory(e.target.value)
                }
                className="w-full appearance-none bg-white border border-gray-200 text-[#1C1C1E] text-sm font-medium px-4 py-2.5 pr-9 rounded-lg outline-none cursor-pointer hover:border-[#FFB700] focus:border-[#FFB700] transition-colors duration-200"
              >
                {categoryOptions.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Brand Dropdown */}
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedBrand}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedBrand(e.target.value)
                }
                className="w-full appearance-none bg-white border border-gray-200 text-[#1C1C1E] text-sm font-medium px-4 py-2.5 pr-9 rounded-lg outline-none cursor-pointer hover:border-[#FFB700] focus:border-[#FFB700] transition-colors duration-200"
              >
                {brandOptions.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* OR divider */}
            <span className="hidden sm:flex items-center text-gray-400 text-xs font-black uppercase flex-shrink-0">
              OR
            </span>

            {/* SKU Input */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={sku}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSku(e.target.value)
                }
                placeholder="Enter SKU"
                className="w-full bg-white border border-gray-200 text-[#1C1C1E] text-sm px-4 py-2.5 rounded-lg outline-none hover:border-[#FFB700] focus:border-[#FFB700] transition-colors duration-200 placeholder:text-gray-400"
              />
            </div>

            {/* Shop Now Button */}
            <button
              onClick={handleShopNow}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-7 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-[#FFB700]/30 whitespace-nowrap"
            >
              Shop Now
              <ArrowRight size={15} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════
            PROMO BANNERS
        ══════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promoBanners.map((banner: PromoBanner) => (
            <div
              key={banner.id}
              className={`${banner.bg} relative rounded-xl overflow-hidden flex items-center justify-between gap-3 px-5 py-5 min-h-[200px] group shadow-md hover:shadow-xl transition-shadow duration-300`}
            >
              {/* Text */}
              <div className="flex flex-col gap-2 z-10 flex-1">
                {banner.tag && (
                  <span className={`${banner.tagColor} text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-fit`}>
                    {banner.tag}
                  </span>
                )}
                <h3 className={`font-black text-2xl md:text-3xl leading-tight ${
                  banner.id === 3 ? "text-[#1C1C1E]" : "text-white"
                }`}>
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className={`font-bold text-base md:text-lg leading-tight ${
                    banner.id === 3 ? "text-[#1C1C1E]" : "text-[#FFB700]"
                  }`}>
                    {banner.subtitle}
                  </p>
                )}
                {banner.highlight && (
                  <p className="font-black text-[#1C1C1E] text-sm md:text-base leading-tight">
                    {banner.highlight}
                  </p>
                )}
                <button className={`mt-2 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide px-4 py-2 rounded transition-all duration-200 w-fit group-hover:gap-2.5
                  ${banner.id === 3
                    ? "bg-[#1C1C1E] text-white hover:bg-[#2C2C2E]"
                    : "bg-[#FFB700] text-[#1C1C1E] hover:bg-[#FFC933]"
                  }`}
                >
                  {banner.cta}
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>

              {/* Product Image */}
              <div className="flex-shrink-0 w-28 md:w-36 h-28 md:h-36 flex items-center justify-center">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Decorative circle */}
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 ${
                banner.id === 3 ? "bg-[#1C1C1E]" : "bg-[#FFB700]"
              }`} />
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════
            FEATURED CATEGORIES
        ══════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#FFB700] rounded-full" />
            <h2 className="text-[#1C1C1E] font-black text-lg md:text-xl uppercase tracking-wide">
              Featured Categories
            </h2>
            <span className="flex-1 h-px bg-gray-200" />
            <a
              href="/categories"
              className="text-[#FFB700] hover:text-[#CC9200] text-sm font-bold flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {categories.map((cat: Category) => (
              <a
                key={cat.id}
                href={cat.href}
                className="group bg-white rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md border border-gray-100 hover:border-[#FFB700] transition-all duration-200 cursor-pointer"
              >
                <div className="w-24 h-24 md:w-50 md:h-50 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                  />
                </div>
                <p className="text-[#1C1C1E] text-xl font-bold text-center leading-tight group-hover:text-[#FFB700] transition-colors duration-200">
                  {cat.label}
                </p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedSection;
