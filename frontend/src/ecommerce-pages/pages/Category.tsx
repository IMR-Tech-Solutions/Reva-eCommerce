import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getpubliccategoriesservice } from "../../services/categoryservices";
import { ArrowRight } from "lucide-react";

// ── Category images + descriptions ──
const CATEGORY_META: Record<string, { image: string; description: string; count: number }> = {
  "reactors": {
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
    description: "Industrial-grade reactors built to precise engineering specifications.",
    count: 12,
  },
  "heat-transfer-equipment": {
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80",
    description: "Precision heat exchangers and thermal management solutions.",
    count: 18,
  },
  "separation-equipment": {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    description: "High-performance separation, filtration and purification systems.",
    count: 9,
  },
  "fluid-handling-equipment": {
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
    description: "Pumps, valves and precision flow control systems.",
    count: 24,
  },
  "size-reduction-equipment": {
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
    description: "Crushers, mills and industrial grinding machinery.",
    count: 7,
  },
  "mixing-equipment": {
    image: "https://images.unsplash.com/photo-1581147036324-c47a03a81d48?w=600&q=80",
    description: "Industrial mixers and high-capacity blending systems.",
    count: 15,
  },
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await getpubliccategoriesservice();
        if (isMounted) setCategories(data);
      } catch (error) {
        console.error("Failed to load categories page", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* ── Section Header ── */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[#1C1C1E] font-black text-2xl md:text-3xl uppercase tracking-tight">
            Shop by{" "}
            <span className="text-[#FFB700]">Category</span>
          </h2>
          <p className="text-gray-500 text-sm">
            Browse our complete range of industrial equipment by category.
          </p>
        </div>

        {/* ── Category Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB700]"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading Categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.slug];
              const imageBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/', '') || "";

              const getImageUrl = () => {
                if (cat.category_image && cat.category_image !== "/media/category_images/default.png") {
                  return cat.category_image.startsWith("http")
                    ? cat.category_image
                    : `${imageBaseUrl}${cat.category_image}`;
                }
                return meta?.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80";
              };

              const currentMeta = {
                image: getImageUrl(),
                description: cat.description || meta?.description || "Browse our premium industrial equipment range.",
                count: cat.product_count || meta?.count || 0
              };
              return (
                <div
                  key={cat.slug}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFB700]/50 hover:shadow-xl transition-all duration-300"
                >
                  {/* ── Image ── */}
                  <div className="relative w-full h-52 overflow-hidden">
                    <img
                      src={currentMeta.image}
                      alt={cat.category_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/70 via-transparent to-transparent" />

                    {/* Product count badge */}
                    <div className="absolute top-3 right-3 bg-[#FFB700] text-[#1C1C1E] text-xs font-black px-2.5 py-1 rounded-sm uppercase">
                      {currentMeta.count} Products
                    </div>

                    {/* Category name on image bottom */}
                    <div className="absolute bottom-3 left-4">
                      <h3 className="text-white font-black text-lg leading-tight drop-shadow-md">
                        {cat.category_name}
                      </h3>
                    </div>
                  </div>

                  {/* ── Info ── */}
                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                      {currentMeta.description}
                    </p>
                    <div className="w-9 h-9 bg-[#F5F5F5] group-hover:bg-[#FFB700] border border-gray-200 group-hover:border-[#FFB700] rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200">
                      <ArrowRight
                        size={16}
                        className="text-gray-400 group-hover:text-[#1C1C1E] group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Bottom yellow bar on hover */}
                  <div className="h-0.5 w-0 group-hover:w-full bg-[#FFB700] transition-all duration-300" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
