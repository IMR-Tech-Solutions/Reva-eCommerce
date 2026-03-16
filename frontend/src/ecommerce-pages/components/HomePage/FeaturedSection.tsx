import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getpubliccategoriesservice } from "../../../services/categoryservices";

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
  href: string;
};

// ── Promo Banners — your images, your categories ──
const promoBanners: PromoBanner[] = [
  {
    id: 1,
    tag: "NEW ARRIVAL",
    tagColor: "bg-[#FFB700] text-[#1C1C1E]",
    title: "REACTORS",
    subtitle: "Industrial Grade",
    highlight: "",
    image: "/ecommerce-images/products/reactor-gmp-pharma-200l.jpg",
    cta: "Shop now",
    bg: "bg-[#1C1C1E]",
    href: "/category/reactors",
  },
  {
    id: 2,
    tag: "NEW STOCK",
    tagColor: "bg-green-500 text-white",
    title: "HEAT TRANSFER",
    subtitle: "Equipment Range",
    highlight: "",
    image: "/ecommerce-images/products/heat-exchanger-plate-5m2.jpg",
    cta: "Shop now",
    bg: "bg-[#2C2C2E]",
    href: "/category/heat-transfer-equipment",
  },
  {
    id: 3,
    tag: "LIMITED OFFER",
    tagColor: "bg-red-500 text-white",
    title: "FLUID HANDLING",
    subtitle: "",
    highlight: "GET THE BEST DEALS",
    image: "/ecommerce-images/products/pump-diaphragm-20m3.jpg",
    cta: "Shop now",
    bg: "bg-[#FFB700]",
    href: "/category/fluid-handling-equipment",
  },
];

// ── Categories — your cat1–cat8 images mapped to your slugs ──
const categoryImages: Record<string, string> = {
  reactors: "/ecommerce-images/products/reactor-ms-continuous-500l.jpg",
  "heat-transfer-equipment":
    "/ecommerce-images/products/heat-exchanger-plate-5m2.jpg",
  "separation-equipment":
    "/ecommerce-images/products/mixer-agitator-tank-2000l.jpg",
  "fluid-handling-equipment":
    "/ecommerce-images/products/distillation-column-500l.jpg",
  "size-reduction-equipment": "/ecommerce-images/products/hammer-mill-50hp.jpg",
  "mixing-equipment": "/ecommerce-images/products/ribbon-blender-1000kg.jpg",
};

// ── Dropdowns ──
// Dropdowns (dynamic options will be set in component)
const initialCategoryOptions: string[] = ["All Categories"];

const brandOptions: string[] = [
  "All Brands",
  "SS316 Grade",
  "SS304 Grade",
  "MS Build",
  "Glass Lined",
  "GMP Certified",
  "ISO Certified",
];

const FeaturedSection = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [sku, setSku] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(initialCategoryOptions);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const data = await getpubliccategoriesservice();
        if (isMounted) {
          setCategories(data);
          setCategoryOptions(["All Categories", ...data.map((c: any) => c.category_name)]);
        }
      } catch (error) {
        console.error("Failed to fetch featured categories", error);
      }
    };
    fetchCats();
    return () => { isMounted = false; };
  }, []);

  const handleShopNow = () => {
    if (selectedCategory !== "All Categories") {
      const matched = categories.find((c) => c.category_name === selectedCategory);
      if (matched) navigate(`/category/${matched.slug}`);
    } else {
      navigate("/e-commerceshop");
    }
  };

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ══ SELECT YOUR PRODUCT BAR ══ */}
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
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
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
                {brandOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* OR */}
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
                placeholder="Enter SKU e.g. REVA-0001"
                className="w-full bg-white border border-gray-200 text-[#1C1C1E] text-sm px-4 py-2.5 rounded-lg outline-none hover:border-[#FFB700] focus:border-[#FFB700] transition-colors duration-200 placeholder:text-gray-400"
              />
            </div>

            {/* Shop Now */}
            <button
              onClick={handleShopNow}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-7 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-[#FFB700]/30 whitespace-nowrap"
            >
              Shop Now
              <ArrowRight size={15} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* ══ PROMO BANNERS ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promoBanners.map((banner) => (
            <div
              key={banner.id}
              onClick={() => navigate(banner.href)}
              className={`${banner.bg} relative rounded-xl overflow-hidden flex items-center justify-between gap-3 px-5 py-5 min-h-[200px] group shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
            >
              {/* Text */}
              <div className="flex flex-col gap-2 z-10 flex-1">
                {banner.tag && (
                  <span
                    className={`${banner.tagColor} text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-fit`}
                  >
                    {banner.tag}
                  </span>
                )}
                <h3
                  className={`font-black text-2xl md:text-3xl leading-tight ${banner.id === 3 ? "text-[#1C1C1E]" : "text-white"
                    }`}
                >
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p
                    className={`font-bold text-base md:text-lg leading-tight ${banner.id === 3 ? "text-[#1C1C1E]" : "text-[#FFB700]"
                      }`}
                  >
                    {banner.subtitle}
                  </p>
                )}
                {banner.highlight && (
                  <p className="font-black text-[#1C1C1E] text-sm md:text-base leading-tight">
                    {banner.highlight}
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(banner.href);
                  }}
                  className={`mt-2 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide px-4 py-2 rounded transition-all duration-200 w-fit group-hover:gap-2.5
            ${banner.id === 3
                      ? "bg-[#1C1C1E] text-white hover:bg-[#2C2C2E]"
                      : "bg-[#FFB700] text-[#1C1C1E] hover:bg-[#FFC933]"
                    }`}
                >
                  {banner.cta}
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </button>
              </div>

              {/* ✅ Product Image — larger size */}
              <div className="flex-shrink-0 w-36 md:w-48 h-36 md:h-48 flex items-center justify-center">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Decorative circle */}
              <div
                className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 ${banner.id === 3 ? "bg-[#1C1C1E]" : "bg-[#FFB700]"
                  }`}
              />
            </div>
          ))}
        </div>

        {/* ══ FEATURED CATEGORIES ══ */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#FFB700] rounded-full" />
            <h2 className="text-[#1C1C1E] font-black text-lg md:text-xl uppercase tracking-wide">
              Featured Categories
            </h2>
            <span className="flex-1 h-px bg-gray-200" />
            <button
              onClick={() => navigate("/e-commerceshop")}
              className="text-[#FFB700] hover:text-[#CC9200] text-sm font-bold flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {categories.slice(0, 6).map((cat) => {
              const imageBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/', '') || "";

              const getImageUrl = () => {
                if (cat.category_image && cat.category_image !== "/media/category_images/default.png") {
                  return cat.category_image.startsWith("http")
                    ? cat.category_image
                    : `${imageBaseUrl}${cat.category_image}`;
                }
                return categoryImages[cat.slug] ?? "/ecommerce-images/cat1.jpg";
              };

              return (
                <div
                  key={cat.slug || cat.id}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group bg-white rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md border border-gray-100 hover:border-[#FFB700] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-24 h-24 md:w-42 md:h-42 flex items-center justify-center">
                    <img
                      src={getImageUrl()}
                      alt={cat.category_name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                    />
                  </div>
                  <p className="text-[#1C1C1E] text-sm font-bold text-center leading-tight group-hover:text-[#FFB700] transition-colors duration-200">
                    {cat.category_name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
