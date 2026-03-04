import { useParams } from "react-router";
import { useState } from "react";
import { products } from "../data/products";
import {

  SlidersHorizontal,
  Package,

  ShoppingCart,
  Search,
  X,
} from "lucide-react";

// ── Types ──
type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const categoryNames: Record<string, string> = {
  "reactors":                  "Reactors",
  "heat-transfer-equipment":   "Heat Transfer Equipment",
  "separation-equipment":      "Separation Equipment",
  "fluid-handling-equipment":  "Fluid Handling Equipment",
  "size-reduction-equipment":  "Size Reduction Equipment",
  "mixing-equipment":          "Mixing Equipment",
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const [search, setSearch]   = useState<string>("");
  const [sort, setSort]       = useState<SortOption>("default");
  const [quoteAdded, setQuoteAdded] = useState<number[]>([]);

  const categoryLabel =
    categoryNames[slug as string] ||
    slug?.replace(/-/g, " ") ||
    "Products";

  // Filter + Search
  const filtered = products
    .filter((p) => p.category === slug)
    .filter((p) =>
      search.trim() === ""
        ? true
        : p.name.toLowerCase().includes(search.toLowerCase())
    );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc")  return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name-asc")   return a.name.localeCompare(b.name);
    return 0;
  });

  const handleAddToQuote = (id: number) => {
    setQuoteAdded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      

      {/* ══ FILTER BAR ══ */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder={`Search ${categoryLabel}...`}
              className="w-full bg-[#F5F5F5] border border-gray-200 text-[#1C1C1E] text-sm pl-9 pr-9 py-2.5 rounded-lg outline-none focus:border-[#FFB700] transition-colors duration-200 placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C1C1E] transition-colors"
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSort(e.target.value as SortOption)
              }
              className="bg-[#F5F5F5] border border-gray-200 text-[#1C1C1E] text-sm px-3 py-2.5 rounded-lg outline-none focus:border-[#FFB700] cursor-pointer transition-colors duration-200"
            >
              <option value="default">Default Sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Result Count */}
          <p className="text-gray-400 text-sm flex-shrink-0 hidden md:block">
            Showing{" "}
            <span className="text-[#1C1C1E] font-bold">{sorted.length}</span>{" "}
            results
          </p>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="max-w-7xl mx-auto px-4 py-10">

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
                className="flex items-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm px-6 py-2.5 rounded-lg transition-colors duration-200"
              >
                <X size={14} />
                Clear Search
              </button>
            )}
          </div>

        ) : (

          /* ── Product Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sorted.map((product) => {
              const isAdded = quoteAdded.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#FFB700]/50 hover:shadow-xl transition-all duration-200 group"
                >

                  {/* Image Area */}
                <div className="w-full h-52 bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
  <img
    src={product.image}
    alt={product.name}
    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
  />
</div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100" />

                  {/* Info */}
                  <div className="flex flex-col gap-2.5 p-4 flex-1">

                    {/* Name */}
                    <h3 className="text-[#1C1C1E] text-sm font-black leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#FFB700] transition-colors duration-200">
                      {product.name}
                    </h3>

                    {/* Specs */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 w-16 flex-shrink-0">
                          Material
                        </span>
                        <span className="text-xs text-[#1C1C1E] font-medium truncate">
                          {product.material}
                        </span>
                      </div>
                      {product.capacity && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 w-16 flex-shrink-0">
                            Capacity
                          </span>
                          <span className="text-xs text-[#1C1C1E] font-medium truncate">
                            {product.capacity}
                          </span>
                        </div>
                      )}
                      {product.pressure && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 w-16 flex-shrink-0">
                            Pressure
                          </span>
                          <span className="text-xs text-[#1C1C1E] font-medium truncate">
                            {product.pressure}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-auto pt-2 border-t border-gray-100">
                      <span className="text-[#FFB700] font-black text-xl">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Quote Button */}
                    <button
                      onClick={() => handleAddToQuote(product.id)}
                      className={`w-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wide py-3 rounded-lg transition-all duration-200
                        ${isAdded
                          ? "bg-[#1C1C1E] text-white hover:bg-[#2C2C2E]"
                          : "bg-[#FFB700] text-[#1C1C1E] hover:bg-[#FFC933] hover:shadow-md hover:shadow-[#FFB700]/30"
                        }`}
                    >
                      <ShoppingCart size={14} />
                      {isAdded ? "Added to Quote ✓" : "Add to Quote"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
