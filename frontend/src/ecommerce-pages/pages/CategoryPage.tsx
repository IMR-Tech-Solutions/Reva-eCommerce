import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { products, Product } from "../data/products";
import { useCart } from "../context/CartContext";
import {
  SlidersHorizontal,
  Package,
  ShoppingCart,
  Search,
  X,
  CheckCircle,
  Minus,
  Plus,
  ArrowLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const categoryNames: Record<string, string> = {
  reactors: "Reactors",
  "heat-transfer-equipment": "Heat Transfer Equipment",
  "separation-equipment": "Separation Equipment",
  "fluid-handling-equipment": "Fluid Handling Equipment",
  "size-reduction-equipment": "Size Reduction Equipment",
  "mixing-equipment": "Mixing Equipment",
};

const formatPrice = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// ── Per-card component for independent qty + quote state ──
const ProductCard = ({
  product,
  navigate,
}: {
  product: Product;
  navigate: (path: string) => void;
}) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      onClick={() => navigate(`/e-commerceshop/${product.id}`)}
      className="relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden
        hover:border-[#FFB700]/50 hover:shadow-xl transition-all duration-200 group cursor-pointer"
    >
      {/* Image */}
      <div className="w-full h-48 sm:h-52 bg-[#F5F5F5] flex items-center justify-center overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Quick View badge */}
        <div className="absolute top-3 right-3 bg-white border border-gray-200 text-[10px] font-black text-[#1C1C1E] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm flex items-center gap-1">
          <Eye size={10} /> Quick View
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Info */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">

        {/* Name */}
        <h3 className="text-[#1C1C1E] text-sm font-black leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#FFB700] transition-colors duration-200">
          {product.name}
        </h3>

        {/* Specs */}
        <div className="bg-[#F5F5F5] rounded-lg p-2.5 flex flex-col gap-1.5">
          {[
            { label: "Material", val: product.material },
            { label: "Capacity", val: product.capacity },
            { label: "Pressure", val: product.pressure },
            { label: "Flow", val: product.flowRate },
            { label: "Motor", val: product.motorHP },
          ]
            .filter((s) => s.val)
            .slice(0, 3)
            .map((spec) => (
              <div key={spec.label} className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-gray-400 w-14 flex-shrink-0">
                  {spec.label}
                </span>
                <span className="text-xs text-[#1C1C1E] font-semibold truncate">
                  {spec.val}
                </span>
              </div>
            ))}
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-wide text-gray-400">
              Starting at
            </span>
            <span className="text-[#FFB700] font-black text-xl leading-none">
              {formatPrice(product.price)}
            </span>
          </div>
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(Math.round(product.price * 1.15))}
          </span>
        </div>

        {/* Qty Counter */}
        <div
          className="flex items-center justify-between bg-[#F5F5F5] border border-gray-200 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); }}
            className="px-4 py-2.5 hover:bg-gray-200 transition-colors text-[#1C1C1E]"
          >
            <Minus size={13} />
          </button>
          <span className="font-black text-sm text-[#1C1C1E] min-w-[32px] text-center">
            {qty}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1); }}
            className="px-4 py-2.5 hover:bg-gray-200 transition-colors text-[#1C1C1E]"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Add to Quote + View Details */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddToQuote}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wide py-2.5 rounded-lg transition-all duration-200
              ${added
                ? "bg-green-500 text-white"
                : "bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] hover:shadow-md hover:shadow-[#FFB700]/20"
              }`}
          >
            {added
              ? <><CheckCircle size={12} /> Added!</>
              : <><ShoppingCart size={12} /> Add to Quote</>
            }
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/e-commerceshop/${product.id}`); }}
            className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wide py-2.5 px-3 rounded-lg bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white transition-colors duration-200 whitespace-nowrap"
          >
            <Eye size={12} /> View
          </button>
        </div>

      </div>

      {/* Bottom accent */}
      <div className="h-0.5 w-0 group-hover:w-full bg-[#FFB700] transition-all duration-300" />
    </div>
  );
};

// ══ MAIN COMPONENT ══
const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [visibleCount, setVisibleCount] = useState(8);

  const categoryLabel =
    categoryNames[slug as string] || slug?.replace(/-/g, " ") || "Products";

  const filtered = products
    .filter((p: Product) => p.category === slug)
    .filter((p: Product) =>
      search.trim() === "" ? true : p.name.toLowerCase().includes(search.toLowerCase())
    );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    return 0;
  });

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;
  const remaining = sorted.length - visibleCount;

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* ══ TOP BAR ══ */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Back + breadcrumb */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate("/e-commerceshop")}
              className="flex items-center gap-1.5 bg-[#F5F5F5] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-gray-600 text-xs font-black uppercase tracking-wide px-3 py-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={13} /> Shop
            </button>
            <div className="hidden md:flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
              <ChevronRight size={10} />
              <span className="capitalize text-[#1C1C1E] font-black">{categoryLabel}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(8); }}
              placeholder={`Search ${categoryLabel}...`}
              className="w-full bg-[#F5F5F5] border border-gray-200 text-[#1C1C1E] text-sm pl-9 pr-9 py-2.5 rounded-lg outline-none focus:border-[#FFB700] transition-colors placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C1C1E]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SlidersHorizontal size={15} className="text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-[#F5F5F5] border border-gray-200 text-[#1C1C1E] text-sm px-3 py-2.5 rounded-lg outline-none focus:border-[#FFB700] cursor-pointer"
            >
              <option value="default">Default Sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Count */}
          <p className="text-gray-400 text-sm flex-shrink-0 hidden lg:block whitespace-nowrap">
            <span className="text-[#1C1C1E] font-black">{sorted.length}</span> results
          </p>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Category Hero */}
        <div className="relative rounded-xl overflow-hidden min-h-[100px] flex items-center shadow-sm">
          <div className="absolute inset-0 bg-[#1C1C1E]" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute left-0 top-0 h-full w-1 bg-[#FFB700]" />
          <div className="relative z-10 px-6 py-5 flex items-center justify-between w-full flex-wrap gap-3">
            <div>
              <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest mb-1">
                Browse Category
              </p>
              <h2 className="text-white font-black text-xl md:text-2xl uppercase">
                {categoryLabel}
              </h2>
            </div>
            <span className="bg-[#FFB700]/15 border border-[#FFB700]/25 text-[#FFB700] text-sm font-black px-4 py-2 rounded-lg">
              {sorted.length} Products
            </span>
          </div>
        </div>

        {sorted.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Package size={36} className="text-gray-300" />
            </div>
            <div className="text-center">
              <h3 className="text-[#1C1C1E] font-black text-xl mb-2">
                {search ? "No results found" : "Products Coming Soon"}
              </h3>
              <p className="text-gray-400 text-sm max-w-sm">
                {search
                  ? `No products match "${search}". Try a different search term.`
                  : `We're adding ${categoryLabel} products shortly. Check back soon.`}
              </p>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                <X size={14} /> Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigate={navigate}
                />
              ))}
            </div>

            {/* ── View More ── */}
            {hasMore && (
              <div className="flex flex-col items-center gap-3 pt-2">
                {/* Progress bar */}
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#FFB700] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(visibleCount / sorted.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Showing <span className="font-black text-[#1C1C1E]">{visibleCount}</span>
                  {" of "}
                  <span className="font-black text-[#1C1C1E]">{sorted.length}</span> products
                </p>
                <button
                  onClick={() => setVisibleCount((c) => c + 8)}
                  className="flex items-center gap-2 bg-[#1C1C1E] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-white font-black text-sm uppercase tracking-wide px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FFB700]/25"
                >
                  Load More ({remaining} remaining)
                </button>
              </div>
            )}

            {/* ── All loaded message ── */}
            {!hasMore && sorted.length > 8 && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="w-full max-w-xs bg-[#FFB700] rounded-full h-1.5" />
                <p className="text-xs text-gray-400 font-semibold">
                  ✓ All <span className="font-black text-[#1C1C1E]">{sorted.length}</span> products loaded
                </p>
                <button
                  onClick={() => navigate("/e-commerceshop")}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#FFB700] text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-6 py-3 rounded-xl transition-all duration-200"
                >
                  <ArrowLeft size={14} /> Back to Shop
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
