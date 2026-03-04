// frontend/src/ecommerce-pages/pages/ProductDetail.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { products } from "../data/products";
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Phone,
  Star,
  Minus,
  Plus,
  Package,
  Zap,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";

const formatPrice = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const ProductDetail = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product  = products.find((p) => p.id === Number(id));

  const [qty, setQty]                   = useState(1);
  const [addedToCart, setAddedToCart]   = useState(false);
  const [wishlisted, setWishlisted]     = useState(false);

  const related = products
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  // ── 404 state ──
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <Package size={52} className="text-gray-300" />
          <h2 className="text-[#1C1C1E] font-black text-2xl">Product Not Found</h2>
          <p className="text-gray-500">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/e-commerceshop")}   // ✅ fixed
            className="bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase px-6 py-3 rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const specs = [
    { label: "Material",  val: product.material  },
    { label: "Capacity",  val: product.capacity  },
    { label: "Pressure",  val: product.pressure  },
    { label: "Flow Rate", val: product.flowRate  },
    { label: "Motor HP",  val: product.motorHP   },
    { label: "Category",  val: product.category?.replace(/-/g, " ") },
    { label: "SKU",       val: `REVA-${String(product.id).padStart(4, "0")}` },
  ].filter((s) => s.val);

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* ══ MAIN PRODUCT SECTION ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT: Image ── */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-28">
              <div className="relative w-full h-72 md:h-96 bg-[#F5F5F5] flex items-center justify-center p-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3 bg-white border border-gray-200 rounded-full p-2 shadow-sm cursor-pointer hover:border-[#FFB700] transition-colors">
                  <Share2 size={16} className="text-gray-500" />
                </div>
              </div>

              {/* Social share */}
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                  Share this product
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { icon: <Facebook size={14} />, bg: "bg-blue-600", label: "Facebook" },
                    { icon: <Twitter  size={14} />, bg: "bg-sky-500",  label: "Twitter"  },
                    { icon: <Linkedin size={14} />, bg: "bg-blue-700", label: "LinkedIn" },
                    { icon: <Mail     size={14} />, bg: "bg-gray-600", label: "Email"    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      className={`${s.bg} text-white p-2.5 rounded-lg hover:opacity-80 transition-opacity`}
                      title={s.label}
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MIDDLE: Product Info ── */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-widest text-[#FFB700] bg-[#FFB700]/10 border border-[#FFB700]/20 px-3 py-1 rounded-full cursor-pointer hover:bg-[#FFB700]/20 transition-colors"
                  onClick={() => navigate(`/category/${product.category}`)}  // ✅ matches layoutcategory
                >
                  {product.category.replace(/-/g, " ")}
                </span>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="text-[10px] text-gray-400 font-semibold truncate max-w-[180px]">
                  {product.name}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-[#1C1C1E] font-black text-2xl md:text-3xl leading-tight">
                {product.name.split(" ").map((word, i) =>
                  i === 0
                    ? <span key={i} className="text-[#FFB700]">{word} </span>
                    : <span key={i}>{word} </span>
                )}
              </h1>

              {/* Stars + SKU */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={15}
                      className={
                        s <= 4
                          ? "text-[#FFB700] fill-[#FFB700]"
                          : "text-gray-200 fill-gray-100"
                      }
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                </div>
                <span className="text-xs text-gray-400">
                  SKU:{" "}
                  <span className="font-bold text-[#1C1C1E]">
                    REVA-{String(product.id).padStart(4, "0")}
                  </span>
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1 py-4 border-y border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Starting Price
                </p>
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-[#FFB700] font-black text-4xl leading-none">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-gray-400 text-sm line-through mb-1">
                    {formatPrice(Math.round(product.price * 1.15))}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full mb-1">
                    Save 13%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * Prices may vary based on customization and quantity.
                </p>
              </div>

              {/* Spec highlights */}
              <div className="grid grid-cols-2 gap-2">
                {specs.slice(0, 4).map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-col gap-0.5 bg-[#F5F5F5] rounded-lg px-3 py-2.5"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                      {spec.label}
                    </span>
                    <span className="text-sm font-bold text-[#1C1C1E] capitalize">
                      {spec.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature bullets */}
              <div className="flex flex-col gap-2">
                {[
                  "Built to industrial-grade engineering standards",
                  "Custom fabrication available on request",
                  "ISO & GMP compliant manufacturing",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle size={15} className="text-[#FFB700] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              {/* Qty + Add to Cart */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">

                  {/* Qty */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-[#F5F5F5]">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-3 hover:bg-gray-200 transition-colors text-[#1C1C1E]"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="px-5 py-3 font-black text-sm text-[#1C1C1E] min-w-[48px] text-center bg-white border-x border-gray-200">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="px-3.5 py-3 hover:bg-gray-200 transition-colors text-[#1C1C1E]"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Add to Quote */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wide py-3.5 px-6 rounded-lg transition-all duration-200 min-w-[160px]
                      ${addedToCart
                        ? "bg-green-500 text-white"
                        : "bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] hover:shadow-lg hover:shadow-[#FFB700]/25"
                      }`}
                  >
                    {addedToCart ? (
                      <><CheckCircle size={16} /> Added to Quote!</>
                    ) : (
                      <><ShoppingCart size={16} /> Add to Quote</>
                    )}
                  </button>
                </div>

                {/* Wishlist + Request Quote */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWishlisted((w) => !w)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-bold transition-all duration-200 flex-1 justify-center
                      ${wishlisted
                        ? "border-red-400 bg-red-50 text-red-500"
                        : "border-gray-200 hover:border-[#FFB700] text-gray-600 hover:text-[#1C1C1E]"
                      }`}
                  >
                    <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                    {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#1C1C1E] bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white text-sm font-bold transition-colors flex-1 justify-center">
                    <Zap size={15} className="text-[#FFB700]" />
                    Request Quote
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Specs Table */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-[#1C1C1E] font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FFB700] rounded-full" />
                Technical Specifications
              </h3>
              <div className="flex flex-col divide-y divide-gray-100">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-4 py-3">
                    <span className="text-xs font-black uppercase tracking-wide text-gray-400 w-24 flex-shrink-0">
                      {spec.label}
                    </span>
                    <span className="text-sm font-semibold text-[#1C1C1E] capitalize">
                      {spec.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Trust + Info ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Trust badges */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
              <h3 className="text-[#1C1C1E] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FFB700] rounded-full" />
                Why Buy From Us
              </h3>
              {[
                { icon: <ShieldCheck size={22} className="text-[#FFB700]" />, title: "Quality Assured",    desc: "ISO certified manufacturing"         },
                { icon: <Truck       size={22} className="text-[#FFB700]" />, title: "Pan India Delivery", desc: "Fast dispatch & tracking"            },
                { icon: <RotateCcw   size={22} className="text-[#FFB700]" />, title: "Custom Build",       desc: "Tailored to your specifications"     },
                { icon: <Phone       size={22} className="text-[#FFB700]" />, title: "24/7 Support",       desc: "Expert engineers available"          },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-[#1C1C1E] font-black text-sm">{b.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="relative bg-[#1C1C1E] rounded-xl overflow-hidden p-5 flex flex-col gap-3">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="absolute left-0 top-0 h-full w-1 bg-[#FFB700]" />
              <div className="relative flex flex-col gap-2">
                <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest">
                  Need Help?
                </p>
                <p className="text-white font-black text-base leading-snug">
                  Talk to our{" "}
                  <span className="text-[#FFB700]">Engineering</span> Team
                </p>
                <p className="text-gray-400 text-xs">
                  Get expert advice, custom quotes and technical support.
                </p>
                <button className="mt-1 flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-4 py-3 rounded-lg transition-colors duration-200">
                  <Phone size={14} />
                  Call Us Now
                </button>
              </div>
            </div>

            {/* Secure Delivery */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck size={24} className="text-[#FFB700]" />
                </div>
                <div>
                  <p className="text-[#1C1C1E] font-black text-sm uppercase tracking-wide">
                    100% Secure Delivery
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Without contacting the courier
                  </p>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <button className="text-[#FFB700] hover:text-[#CC9200] text-xs font-black uppercase tracking-wide flex items-center gap-1 transition-colors">
                Discover more <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ══ RELATED PRODUCTS ══ */}
        {related.length > 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#FFB700] rounded-full" />
              <h2 className="text-[#1C1C1E] font-black text-xl md:text-2xl uppercase tracking-tight">
                Related <span className="text-[#FFB700]">Products</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/product/${rel.id}`)}   // ✅ fixed
                  className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer
                    hover:shadow-xl hover:border-[#FFB700]/50 transition-all duration-200 group"
                >
                  <div className="w-full h-44 bg-[#F5F5F5] flex items-center justify-center p-5 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h4 className="text-sm font-black text-[#1C1C1E] leading-snug line-clamp-2 group-hover:text-[#FFB700] transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-xs text-gray-500">{rel.material}</p>
                    <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[#FFB700] font-black text-base">
                        {formatPrice(rel.price)}
                      </span>
                      <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-[#FFB700] transition-colors">
                        View →
                      </span>
                    </div>
                  </div>
                  <div className="h-0.5 w-0 group-hover:w-full bg-[#FFB700] transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
