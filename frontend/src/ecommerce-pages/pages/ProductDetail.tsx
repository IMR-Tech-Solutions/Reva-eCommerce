import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  getsingleproductservice,
  getpublicproductsservice,
} from "../../services/productservices";
import { ProductData } from "../../types/types";
import {
  ShoppingCart, Heart, Share2, ChevronRight, CheckCircle,
  Truck, ShieldCheck, RotateCcw, Phone, Star, Minus, Plus,
  Package, Zap, Facebook, Twitter, Linkedin, Mail,
  ArrowLeft, BadgeCheck, Layers, Award, ChevronLeft,
} from "lucide-react";
import { handleError } from "../../utils/handleError";

const formatPrice = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// Utility to handle backend image URLs
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"; // Fallback
  if (imagePath.startsWith("http")) return imagePath;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
  const domain = baseUrl.replace("/api/", "");
  return `${domain}${imagePath}`;
};

// ── Standalone Related Card ──
const RelatedCard = ({
  rel,
  navigate,
}: {
  rel: ProductData;
  navigate: (p: string) => void;
}) => (
  <div
    onClick={() => navigate(`/e-commerceshop/${rel.id}`)}
    className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer
      hover:shadow-2xl hover:border-[#FFB700]/40 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="w-full h-44 bg-gradient-to-br from-[#F5F5F5] to-gray-100 flex items-center justify-center p-5 overflow-hidden relative">
      <img
        src={getImageUrl(rel.product_image)}
        alt={rel.product_name}
        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-[#FFB700]/0 group-hover:bg-[#FFB700]/5 transition-colors duration-300" />
    </div>
    <div className="p-4 flex flex-col gap-2 flex-1">
      <h4 className="text-sm font-black text-[#1C1C1E] leading-snug line-clamp-2 group-hover:text-[#FFB700] transition-colors">
        {rel.product_name}
      </h4>
      {rel.material && (
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {rel.material}
        </p>
      )}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
        <span className="text-[#FFB700] font-black text-base">{formatPrice(Number(rel.price))}</span>
        <span className="text-[10px] font-black uppercase bg-[#FFB700]/10 text-[#CC9200] px-2 py-1 rounded-lg group-hover:bg-[#FFB700] group-hover:text-[#1C1C1E] transition-all">
          View →
        </span>
      </div>
    </div>
    <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#FFB700] to-[#FFC933] transition-all duration-500" />
  </div>
);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ProductData[]>([]);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "shipping">(
    "specs"
  );

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getsingleproductservice(Number(id));
        setProduct(data);

        // Optional: Fetch related products by category
        if (data.category) {
          const allProds = await getpublicproductsservice();
          const filtered = allProds
            .filter(
              (p: ProductData) =>
                p.category === data.category && p.id !== data.id
            )
            .slice(0, 4);
          setRelated(filtered);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // ── 404 ──
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-5 max-w-sm">
          <div className="w-24 h-24 bg-white border border-gray-200 rounded-3xl flex items-center justify-center shadow-sm">
            <Package size={40} className="text-gray-300" />
          </div>
          <div>
            <h2 className="text-[#1C1C1E] font-black text-2xl mb-2">Product Not Found</h2>
            <p className="text-gray-500 text-sm">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <button
            onClick={() => navigate("/e-commerceshop")}
            className="flex items-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-[#FFB700]/30"
          >
            <ArrowLeft size={16} /> Back to Shop
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
    { label: "Material", val: product.material },
    { label: "Capacity", val: product.capacity },
    { label: "Pressure", val: product.pressure },
    { label: "Flow Rate", val: product.flow_rate },
    { label: "Motor HP", val: product.motor_hp },
    { label: "Category", val: product.category_name },
    { label: "SKU", val: product.sku_code || `REVA-${String(product.id).padStart(4, "0")}` },
  ].filter((s) => s.val);

  const tabs = [
    { key: "specs", label: "Specifications" },
    { key: "features", label: "Features" },
    { key: "shipping", label: "Shipping Info" },
  ] as const;

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* ══ TOP NAV BAR ══ */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Back + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/e-commerceshop")}
              className="flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-gray-600 text-xs font-black uppercase tracking-wide px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              <ChevronLeft size={14} /> Back to Shop
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 min-w-0">
              <span
                className="hover:text-[#FFB700] cursor-pointer transition-colors flex-shrink-0"
                onClick={() => navigate("/")}
              >
                Home
              </span>
              <ChevronRight size={10} className="flex-shrink-0" />
              <span
                className="hover:text-[#FFB700] cursor-pointer transition-colors flex-shrink-0"
                onClick={() => navigate("/e-commerceshop")}
              >
                Shop
              </span>
              <ChevronRight size={10} className="flex-shrink-0" />
              <span
                className="hover:text-[#FFB700] cursor-pointer transition-colors flex-shrink-0 capitalize"
                onClick={() => navigate(`/category/${product.category}`)}
              >
                {product.category_name}
              </span>
              <ChevronRight size={10} className="flex-shrink-0" />
              <span className="text-[#1C1C1E] font-bold truncate">{product.product_name}</span>
            </div>
          </div>

          {/* Share */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {[
              { icon: <Facebook size={13} />, bg: "bg-blue-600", label: "Facebook" },
              { icon: <Twitter size={13} />, bg: "bg-sky-500", label: "Twitter" },
              { icon: <Linkedin size={13} />, bg: "bg-[#FFB700]", label: "LinkedIn" },
              { icon: <Share2 size={13} />, bg: "bg-gray-500", label: "Share" },
            ].map((s) => (
              <button
                key={s.label}
                title={s.label}
                className={`${s.bg} text-white p-2 rounded-lg hover:opacity-80 transition-opacity hidden sm:flex`}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-10">

        {/* ══ MAIN SECTION ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT: Image Panel ── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 flex flex-col gap-4">

              {/* Main image */}
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="relative w-full h-80 md:h-96 bg-gradient-to-br from-[#FAFAFA] to-gray-100 flex items-center justify-center p-10">
                  <img
                    src={getImageUrl(product.product_image)}
                    alt={product.product_name}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                  <div className="absolute top-4 left-4 bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                    {product.category_name}
                  </div>
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full">
                    Save 13%
                  </div>
                </div>

                {/* Thumbnails row */}
                <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all
                        ${i === 1 ? "border-[#FFB700]" : "border-gray-100 hover:border-[#FFB700]/50"}`}
                    >
                      <img
                        src={getImageUrl(product.product_image)}
                        alt=""
                        className="w-full h-full object-contain bg-[#F5F5F5] p-1"
                      />
                    </div>
                  ))}
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                    +3
                  </div>
                </div>
              </div>

              {/* Social share mobile */}
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between sm:hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Share</span>
                <div className="flex items-center gap-2">
                  {[
                    { icon: <Facebook size={13} />, bg: "bg-blue-600" },
                    { icon: <Twitter size={13} />, bg: "bg-sky-500" },
                    { icon: <Mail size={13} />, bg: "bg-gray-500" },
                  ].map((s, i) => (
                    <button key={i} className={`${s.bg} text-white p-2 rounded-lg`}>{s.icon}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MIDDLE: Info ── */}
          <div className="lg:col-span-5 flex flex-col gap-5">

            {/* Name + Stars card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">

              {/* SKU */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  SKU: REVA-{String(product.id).padStart(4, "0")}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
                <BadgeCheck size={14} className="text-green-500" />
                <span className="text-[10px] font-black text-green-600">In Stock</span>
              </div>

              {/* Name */}
              <h1 className="text-[#1C1C1E] font-black text-2xl md:text-3xl leading-tight">
                {product.product_name.split(" ").map((word: string, i: number) =>
                  i === 0
                    ? <span key={i} className="text-[#FFB700]">{word} </span>
                    : <span key={i}>{word} </span>
                )}
              </h1>

              {/* Stars */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-[#FFB700]/10 px-3 py-1.5 rounded-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13}
                      className={s <= 4 ? "text-[#FFB700] fill-[#FFB700]" : "text-gray-200 fill-gray-100"} />
                  ))}
                  <span className="text-xs font-black text-[#1C1C1E] ml-1">4.0</span>
                </div>
                <span className="text-xs text-gray-400">(55 reviews)</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-[#FFB700] font-bold">48 sold this month</span>
              </div>

              {/* Price block */}
              <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] rounded-2xl p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Starting Price
                  </span>
                  <span className="text-[#FFB700] font-black text-4xl leading-none">
                    {formatPrice(Number(product.price))}
                  </span>
                  <span className="text-gray-500 text-xs line-through mt-0.5">
                    {formatPrice(Math.round(Number(product.price) * 1.15))}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-black px-3 py-1.5 rounded-full">
                    Save 13%
                  </span>
                  <span className="text-[10px] text-gray-500 text-right max-w-[120px] leading-relaxed">
                    * May vary by quantity & customization
                  </span>
                </div>
              </div>

              {/* Spec highlights grid */}
              <div className="grid grid-cols-2 gap-2">
                {specs.slice(0, 4).map((spec) => (
                  <div key={spec.label}
                    className="flex flex-col gap-0.5 bg-[#F5F5F5] hover:bg-[#FFB700]/5 border border-transparent hover:border-[#FFB700]/20 rounded-xl px-3 py-2.5 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      {spec.label}
                    </span>
                    <span className="text-sm font-black text-[#1C1C1E] capitalize">{spec.val}</span>
                  </div>
                ))}
              </div>

              {/* Feature bullets */}
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  "Built to industrial-grade engineering standards",
                  "Custom fabrication available on request",
                  "ISO & GMP compliant manufacturing",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {/* Qty + Add to Cart */}
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
                  <span className="text-xs text-gray-500">
                    Min order: <span className="font-bold text-[#1C1C1E]">1 unit</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Qty counter */}
                  <div className="flex items-center bg-[#F5F5F5] border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-4 py-3 hover:bg-gray-200 transition-colors text-[#1C1C1E] font-black"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-5 py-3 font-black text-sm text-[#1C1C1E] min-w-[52px] text-center bg-white border-x border-gray-200">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="px-4 py-3 hover:bg-gray-200 transition-colors text-[#1C1C1E] font-black"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Quote */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wide py-3.5 px-5 rounded-xl transition-all duration-300 min-w-[150px]
                      ${addedToCart
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] hover:shadow-xl hover:shadow-[#FFB700]/30 hover:-translate-y-0.5"
                      }`}
                  >
                    {addedToCart
                      ? <><CheckCircle size={16} /> Added to Quote!</>
                      : <><ShoppingCart size={16} /> Add to Quote</>
                    }
                  </button>
                </div>

                {/* Wishlist + Request Quote */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWishlisted((w) => !w)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all duration-200 flex-1 justify-center
                      ${wishlisted
                        ? "border-red-400 bg-red-50 text-red-500"
                        : "border-gray-200 hover:border-[#FFB700] text-gray-600 hover:text-[#1C1C1E] bg-white"
                      }`}
                  >
                    <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                    {wishlisted ? "Wishlisted" : "Wishlist"}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white text-sm font-bold transition-all duration-200 flex-1 justify-center hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20">
                    <Zap size={15} className="text-[#FFB700]" />
                    Request Quote
                  </button>
                </div>
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-200
                      ${activeTab === tab.key
                        ? "text-[#1C1C1E] border-b-2 border-[#FFB700] bg-[#FFB700]/5"
                        : "text-gray-400 hover:text-[#1C1C1E] hover:bg-gray-50"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === "specs" && (
                  <div className="flex flex-col divide-y divide-gray-50">
                    {specs.map((spec, i) => (
                      <div key={spec.label}
                        className={`flex items-center gap-4 py-3 ${i % 2 === 0 ? "bg-transparent" : ""}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-24 flex-shrink-0">
                          {spec.label}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-sm font-bold text-[#1C1C1E] capitalize text-right">
                          {spec.val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: <Layers size={16} />, title: "Modular Design", desc: "Easy to assemble, disassemble and maintain in field conditions." },
                      { icon: <Award size={16} />, title: "ISO 9001 Certified", desc: "Manufactured under strict quality management systems." },
                      { icon: <ShieldCheck size={16} />, title: "Corrosion Resistant", desc: "Premium grade materials for long-term durability." },
                      { icon: <Zap size={16} />, title: "Energy Efficient", desc: "Optimized design for low power consumption." },
                    ].map((f) => (
                      <div key={f.title} className="flex items-start gap-3 p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#FFB700]/5 transition-colors">
                        <div className="w-8 h-8 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-lg flex items-center justify-center flex-shrink-0 text-[#FFB700]">
                          {f.icon}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1C1C1E]">{f.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: <Truck size={16} />, title: "Pan India Delivery", desc: "Ships to all major cities within 5-7 business days." },
                      { icon: <Package size={16} />, title: "Safe Packaging", desc: "Industrial-grade packaging to prevent transit damage." },
                      { icon: <RotateCcw size={16} />, title: "Custom Lead Time", desc: "Custom orders take 15-20 business days for fabrication." },
                      { icon: <Phone size={16} />, title: "Live Tracking", desc: "Get real-time shipment updates via SMS and email." },
                    ].map((f) => (
                      <div key={f.title} className="flex items-start gap-3 p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#FFB700]/5 transition-colors">
                        <div className="w-8 h-8 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-lg flex items-center justify-center flex-shrink-0 text-[#FFB700]">
                          {f.icon}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1C1C1E]">{f.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Trust sidebar ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Trust badges */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
              <h3 className="text-[#1C1C1E] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FFB700] rounded-full" />
                Why Choose Us
              </h3>
              {[
                { icon: <ShieldCheck size={20} />, title: "Quality Assured", desc: "ISO certified manufacturing" },
                { icon: <Truck size={20} />, title: "Pan India Delivery", desc: "Fast dispatch & live tracking" },
                { icon: <RotateCcw size={20} />, title: "Custom Build", desc: "Tailored to your specifications" },
                { icon: <Phone size={20} />, title: "24/7 Support", desc: "Expert engineers on call" },
              ].map((b) => (
                <div key={b.title} className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#FFB700]/5 transition-colors group/item">
                  <div className="w-9 h-9 bg-white border border-gray-200 group-hover/item:border-[#FFB700]/30 group-hover/item:bg-[#FFB700]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#FFB700] transition-all">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-[#1C1C1E] font-black text-xs">{b.title}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="relative bg-[#1C1C1E] rounded-3xl overflow-hidden p-5 flex flex-col gap-3 shadow-sm">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#FFB700] to-[#FFC933]" />
              <div className="relative flex flex-col gap-3">
                <div className="w-10 h-10 bg-[#FFB700]/15 border border-[#FFB700]/25 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-[#FFB700]" />
                </div>
                <div>
                  <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest mb-1">Need Help?</p>
                  <p className="text-white font-black text-base leading-snug">
                    Talk to our <span className="text-[#FFB700]">Engineering</span> Team
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Expert advice, custom quotes & technical support.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-xs uppercase tracking-wide px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#FFB700]/30">
                  <Phone size={13} /> Call Us Now
                </button>
              </div>
            </div>

            {/* Delivery card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Truck size={22} className="text-[#FFB700]" />
                </div>
                <div>
                  <p className="text-[#1C1C1E] font-black text-sm">100% Secure Delivery</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Non-contact, fully insured shipping</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Dispatch", val: "2-3 days" },
                  { label: "Delivery", val: "5-7 days" },
                  { label: "Coverage", val: "Pan India" },
                  { label: "Insurance", val: "Included" },
                ].map((d) => (
                  <div key={d.label} className="bg-[#F5F5F5] rounded-lg px-2.5 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">{d.label}</p>
                    <p className="text-xs font-black text-[#1C1C1E] mt-0.5">{d.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Accepted Payments
              </p>
              <div className="flex flex-wrap gap-2">
                {["NEFT/RTGS", "UPI", "Cheque", "Credit"].map((p) => (
                  <span key={p} className="text-[10px] font-black bg-[#F5F5F5] border border-gray-200 text-[#1C1C1E] px-2.5 py-1.5 rounded-lg">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ RELATED PRODUCTS ══ */}
        {related.length > 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 bg-[#FFB700] rounded-full" />
                <h2 className="text-[#1C1C1E] font-black text-xl md:text-2xl uppercase tracking-tight">
                  Related <span className="text-[#FFB700]">Products</span>
                </h2>
              </div>
              <button
                onClick={() => navigate("/e-commerceshop")}
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-gray-500 hover:text-[#FFB700] transition-colors"
              >
                View All <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((rel: ProductData) => (
                <RelatedCard key={rel.id} rel={rel} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* ══ BACK TO SHOP ══ */}
        <div className="flex items-center justify-center py-4">
          <button
            onClick={() => navigate("/e-commerceshop")}
            className="flex items-center gap-2.5 bg-[#1C1C1E] hover:bg-[#FFB700] text-white hover:text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#FFB700]/30 hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
