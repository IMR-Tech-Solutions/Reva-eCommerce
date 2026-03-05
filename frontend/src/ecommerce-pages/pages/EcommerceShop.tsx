import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { products, Product } from "../data/products";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  X,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Eye,
} from "lucide-react";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";
type Range = { min: number; max: number };

const PRODUCTS_PER_PAGE = 6;

const getPriceRange = (items: Product[]): Range => {
  if (!items.length) return { min: 0, max: 0 };
  const prices = items.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

const uniqueValues = (items: Product[], key: keyof Product): string[] => {
  const set = new Set<string>();
  items.forEach((p) => {
    const val = p[key];
    if (val && typeof val === "string") set.add(val);
  });
  return Array.from(set);
};

const formatPrice = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// ── Custom Radio Option ──
const RadioOption = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150
      ${
        selected
          ? "bg-[#FFB700]/10 border border-[#FFB700] text-[#1C1C1E] font-bold"
          : "border border-transparent hover:bg-gray-50 text-gray-600 hover:text-[#1C1C1E]"
      }`}
  >
    <div
      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
        ${selected ? "border-[#FFB700] bg-[#FFB700]" : "border-gray-300"}`}
    >
      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    <span className="capitalize truncate">{label.replace(/-/g, " ")}</span>
  </button>
);

// ── Filter Block ──
const FilterBlock = ({
  title,
  isOpen,
  onToggle,
  children,
  activeCount = 0,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  activeCount?: number;
}) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#1C1C1E]">
          {title}
        </span>
        {activeCount > 0 && (
          <span className="bg-[#FFB700] text-[#1C1C1E] text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
            {activeCount}
          </span>
        )}
      </div>
      {isOpen ? (
        <ChevronUp size={15} className="text-[#FFB700] flex-shrink-0" />
      ) : (
        <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-3 pb-3 flex flex-col gap-1">{children}</div>
    )}
  </div>
);

// ── Product Card ──
const ProductCard = ({
  product,
  onViewDetails,
}: {
  product: Product;
  onViewDetails: () => void;
}) => {
  const [qty, setQty] = useState(1);

  const specs = [
    { label: "Material", val: product.material },
    { label: "Capacity", val: product.capacity },
    { label: "Pressure", val: product.pressure },
    { label: "Flow", val: product.flowRate },
    { label: "Motor", val: product.motorHP },
  ].filter((s) => s.val);

  return (
    <div
      className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden
        hover:shadow-xl hover:border-[#FFB700]/50 transition-all duration-200 group cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Image */}
      <div className="w-full h-52 bg-[#F5F5F5] flex items-center justify-center overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white border border-gray-200 text-[10px] font-black text-[#1C1C1E] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
          Quick View
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* ── PRICE (top) ── */}
        <div className="flex items-center justify-between">
          <span className="text-[#FFB700] font-black text-xl leading-none">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] font-black uppercase text-gray-400 bg-[#F5F5F5] px-2 py-1 rounded-md">
            per unit
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-black text-[#1C1C1E] leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#FFB700] transition-colors duration-200">
          {product.name}
        </h3>

        {/* Specs */}
        <div className="bg-[#F5F5F5] rounded-lg p-3 flex flex-col gap-1.5">
          {specs.map((spec) => (
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

        {/* ── QUANTITY COUNTER ── */}
        <div
          className="flex items-center justify-between border border-gray-200 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex items-center justify-center w-10 h-10 bg-[#F5F5F5] hover:bg-[#FFB700]/20 text-[#1C1C1E] transition-colors duration-150 flex-shrink-0"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-1">
            <span className="text-sm font-black text-[#1C1C1E]">{qty}</span>
            <span className="text-[10px] text-gray-400 font-medium">unit{qty > 1 ? "s" : ""}</span>
          </div>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex items-center justify-center w-10 h-10 bg-[#F5F5F5] hover:bg-[#FFB700]/20 text-[#1C1C1E] transition-colors duration-150 flex-shrink-0"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Total price (quantity × unit price) */}
        {qty > 1 && (
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-gray-400">
              {qty} × {formatPrice(product.price)}
            </span>
            <span className="font-black text-[#1C1C1E]">
              = {formatPrice(qty * product.price)}
            </span>
          </div>
        )}

        {/* ── CTA BUTTONS ── */}
        <div
          className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add to Quote */}
          <button
            type="button"
            onClick={() => {
              // hook up your quote logic here
            }}
            className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide
              text-[#1C1C1E] bg-[#FFB700] hover:bg-[#FFC933] hover:shadow-md hover:shadow-[#FFB700]/20
              px-4 py-2.5 rounded-lg transition-all duration-200"
          >
            <ShoppingCart size={13} />
            Add to Quote
            {qty > 1 && (
              <span className="bg-[#1C1C1E]/10 text-[#1C1C1E] text-[10px] px-1.5 py-0.5 rounded-full">
                ×{qty}
              </span>
            )}
          </button>

          {/* View Details */}
          <button
            type="button"
            onClick={onViewDetails}
            className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide
              text-[#1C1C1E] bg-white border border-gray-200 hover:border-[#FFB700]/60 hover:bg-[#FFB700]/5
              px-4 py-2.5 rounded-lg transition-all duration-200"
          >
            <Eye size={13} />
            View Details
          </button>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5 w-0 group-hover:w-full bg-[#FFB700] transition-all duration-300" />
    </div>
  );
};

const EcommerceShop = () => {
  const allProducts = products;
  const navigate = useNavigate();

  const priceRange = useMemo(() => getPriceRange(allProducts), [allProducts]);
  const materials  = useMemo(() => uniqueValues(allProducts, "material"),  [allProducts]);
  const pressures  = useMemo(() => uniqueValues(allProducts, "pressure"),  [allProducts]);
  const flowRates  = useMemo(() => uniqueValues(allProducts, "flowRate"),  [allProducts]);
  const motorHPs   = useMemo(() => uniqueValues(allProducts, "motorHP"),   [allProducts]);
  const categories = useMemo(() => uniqueValues(allProducts, "category"),  [allProducts]);

  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedPressure, setSelectedPressure] = useState<string | null>(null);
  const [selectedFlowRate, setSelectedFlowRate] = useState<string | null>(null);
  const [selectedMotorHP,  setSelectedMotorHP]  = useState<string | null>(null);
  const [price,            setPrice]            = useState<number>(
    () => Math.max(...products.map((p) => p.price))
  );
  const [sort,             setSort]             = useState<SortOption>("default");
  const [currentPage,      setCurrentPage]      = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    category: true,
    price:    true,
    material: true,
    pressure: false,
    flow:     false,
    motor:    false,
  });

  const toggleBlock = (key: string) =>
    setOpenBlocks((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    if (selectedMaterial) list = list.filter((p) => p.material === selectedMaterial);
    if (selectedPressure) list = list.filter((p) => p.pressure === selectedPressure);
    if (selectedFlowRate) list = list.filter((p) => p.flowRate === selectedFlowRate);
    if (selectedMotorHP)  list = list.filter((p) => p.motorHP  === selectedMotorHP);
    list = list.filter((p) => p.price <= price);
    list.sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc")   return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [
    allProducts, searchTerm, selectedCategory, selectedMaterial,
    selectedPressure, selectedFlowRate, selectedMotorHP, price, sort,
  ]);

  const totalPages    = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage      = Math.min(currentPage, totalPages);
  const startIndex    = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pagedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilter = <T,>(setter: (v: T) => void) =>
    (v: T) => { setter(v); setCurrentPage(1); };

  const activeFilterCount = [
    selectedCategory, selectedMaterial, selectedPressure,
    selectedFlowRate, selectedMotorHP,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedMaterial(null);
    setSelectedPressure(null);
    setSelectedFlowRate(null);
    setSelectedMotorHP(null);
    setPrice(Math.max(...products.map((p) => p.price)));
    setSearchTerm("");
    setCurrentPage(1);
  };

  const pageButtons = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      ) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const SidebarContent = () => (
    <div className="flex flex-col">
      <div className="bg-[#1C1C1E] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
          <span className="text-white text-sm font-black uppercase tracking-wide">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-gray-400 hover:text-[#FFB700] tracking-wide transition-colors"
          >
            <X size={11} />
            Clear all
          </button>
        )}
      </div>

      <FilterBlock title="Categories" isOpen={openBlocks.category} onToggle={() => toggleBlock("category")} activeCount={selectedCategory ? 1 : 0}>
        {categories.map((cat) => (
          <RadioOption
            key={cat}
            label={cat.replace(/-/g, " ")}
            selected={selectedCategory === cat}
            onClick={() => handleFilter(setSelectedCategory)(selectedCategory === cat ? null : cat)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Price Range" isOpen={openBlocks.price} onToggle={() => toggleBlock("price")}>
        <div className="px-1 mt-1">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-gray-500">{formatPrice(priceRange.min)}</span>
            <span className="bg-[#FFB700]/10 border border-[#FFB700]/30 text-[#1C1C1E] font-black text-xs px-2.5 py-1 rounded-lg">
              {formatPrice(price)}
            </span>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={price}
            onChange={(e) => { setPrice(Number(e.target.value)); setCurrentPage(1); }}
            className="w-full accent-[#FFB700]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>Min</span>
            <span>Max: {formatPrice(priceRange.max)}</span>
          </div>
        </div>
      </FilterBlock>

      <FilterBlock title="Material" isOpen={openBlocks.material} onToggle={() => toggleBlock("material")} activeCount={selectedMaterial ? 1 : 0}>
        {materials.map((m) => (
          <RadioOption
            key={m}
            label={m}
            selected={selectedMaterial === m}
            onClick={() => handleFilter(setSelectedMaterial)(selectedMaterial === m ? null : m)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Pressure" isOpen={openBlocks.pressure} onToggle={() => toggleBlock("pressure")} activeCount={selectedPressure ? 1 : 0}>
        {pressures.map((p) => (
          <RadioOption
            key={p}
            label={p}
            selected={selectedPressure === p}
            onClick={() => handleFilter(setSelectedPressure)(selectedPressure === p ? null : p)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Flow Rate" isOpen={openBlocks.flow} onToggle={() => toggleBlock("flow")} activeCount={selectedFlowRate ? 1 : 0}>
        {flowRates.map((f) => (
          <RadioOption
            key={f}
            label={f}
            selected={selectedFlowRate === f}
            onClick={() => handleFilter(setSelectedFlowRate)(selectedFlowRate === f ? null : f)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Motor HP" isOpen={openBlocks.motor} onToggle={() => toggleBlock("motor")} activeCount={selectedMotorHP ? 1 : 0}>
        {motorHPs.map((hp) => (
          <RadioOption
            key={hp}
            label={hp}
            selected={selectedMotorHP === hp}
            onClick={() => handleFilter(setSelectedMotorHP)(selectedMotorHP === hp ? null : hp)}
          />
        ))}
      </FilterBlock>
    </div>
  );

  return (
    <section className="bg-[#F5F5F5] min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row">

        {/* ══ DESKTOP SIDEBAR ══ */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-28 max-h-[82vh] overflow-y-auto shadow-sm">
            <SidebarContent />
          </div>
        </aside>

        {/* ══ MOBILE OVERLAY ══ */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ══ MOBILE DRAWER ══ */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white z-[60] lg:hidden
            transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="bg-[#FFB700] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
            <span className="text-[#1C1C1E] font-black text-sm uppercase tracking-wide">
              Shop by Filters
            </span>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 hover:bg-[#CC9200] rounded transition-colors"
            >
              <X size={20} className="text-[#1C1C1E]" />
            </button>
          </div>
          <SidebarContent />
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* ── TOP BAR ── */}
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#1C1C1E] text-white text-sm font-black uppercase tracking-wide px-4 py-2.5 rounded-lg w-fit"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search industrial equipment..."
                className="w-full bg-[#F5F5F5] border border-gray-200 text-sm text-[#1C1C1E] pl-10 pr-9 py-3 rounded-lg outline-none focus:border-[#FFB700] transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C1C1E]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
              <p className="text-sm text-gray-500 hidden sm:block whitespace-nowrap">
                <span className="font-black text-[#1C1C1E]">{filteredProducts.length}</span>{" "}results
              </p>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gray-400 flex-shrink-0" />
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value as SortOption); setCurrentPage(1); }}
                  className="bg-[#F5F5F5] border border-gray-200 text-sm text-[#1C1C1E] px-3 py-2.5 rounded-lg outline-none focus:border-[#FFB700] cursor-pointer"
                >
                  <option value="default">Default sorting</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── PROMO BANNER ── */}
          <div className="relative rounded-xl overflow-hidden min-h-[140px] md:min-h-[160px] flex items-center shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80)" }}
            />
            <div className="absolute inset-0 bg-[#1C1C1E]/82" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute left-0 top-0 h-full w-1 bg-[#FFB700]" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-7 py-6 gap-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest">
                  🏭 Industrial Equipment
                </p>
                <h3 className="text-white font-black text-lg md:text-2xl uppercase leading-tight">
                  Bulk Orders?{" "}
                  <span className="text-[#FFB700]">Get Custom Quotes</span>
                </h3>
                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                  Tailored solutions for your process engineering needs.
                </p>
              </div>
              <button className="flex-shrink-0 flex items-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-6 py-3 rounded-lg transition-colors duration-200 whitespace-nowrap">
                <ShoppingCart size={16} />
                Request a Quote
              </button>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FFB700] via-[#FFB700]/50 to-transparent" />
          </div>

          {/* ── PRODUCT GRID ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-bold text-[#1C1C1E]">{startIndex + 1}</span>
                  {" – "}
                  <span className="font-bold text-[#1C1C1E]">
                    {Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)}
                  </span>
                  {" of "}
                  <span className="font-bold text-[#1C1C1E]">{filteredProducts.length}</span>
                  {" products"}
                </p>
                <p className="text-xs text-gray-400">
                  Page{" "}
                  <span className="font-bold text-[#1C1C1E]">{safePage}</span>
                  {" of "}
                  <span className="font-bold text-[#1C1C1E]">{totalPages}</span>
                </p>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                  <Package size={32} className="text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-[#1C1C1E] font-black text-lg mb-1">No results found</p>
                  <p className="text-sm text-gray-500">Adjust your filters or search term.</p>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase px-5 py-2.5 rounded-lg"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pagedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={() => navigate(`/e-commerceshop/${product.id}`)}
                    />
                  ))}
                </div>

                {/* ── PAGINATION ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                    <button
                      type="button"
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                        ${safePage === 1
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-[#1C1C1E] text-white hover:bg-[#FFB700] hover:text-[#1C1C1E]"
                        }`}
                    >
                      <ChevronLeft size={15} />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {pageButtons.map((btn, i) =>
                      btn === "..." ? (
                        <span key={`dot-${i}`} className="px-2 py-2.5 text-gray-400 text-sm font-bold">
                          ...
                        </span>
                      ) : (
                        <button
                          key={btn}
                          type="button"
                          onClick={() => goToPage(btn as number)}
                          className={`w-10 h-10 rounded-lg text-sm font-black transition-all duration-200
                            ${safePage === btn
                              ? "bg-[#FFB700] text-[#1C1C1E] shadow-md shadow-[#FFB700]/30"
                              : "bg-gray-100 text-gray-600 hover:bg-[#1C1C1E] hover:text-white"
                            }`}
                        >
                          {btn}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === totalPages}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                        ${safePage === totalPages
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-[#1C1C1E] text-white hover:bg-[#FFB700] hover:text-[#1C1C1E]"
                        }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcommerceShop;
