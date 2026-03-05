// frontend/src/ecommerce-pages/pages/CartPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import {
  Minus, Plus, X, ShoppingCart, ArrowLeft,
  Trash2, Tag, Truck, ShieldCheck, Phone,
  CheckCircle, ChevronRight, Package, Zap,
  BadgeCheck, Clock,
} from "lucide-react";

const formatPrice = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// ══ MAIN ══
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQty, removeItem, clearCart, cartCount: totalQty } = useCart();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;



  // ── Empty State ──
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-6 max-w-md w-full text-center">
          <div className="relative">
            <div className="w-28 h-28 bg-[#F5F5F5] rounded-3xl flex items-center justify-center">
              <ShoppingCart size={48} className="text-gray-200" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFB700] rounded-full flex items-center justify-center">
              <span className="text-[#1C1C1E] font-black text-sm">0</span>
            </div>
          </div>
          <div>
            <h2 className="text-[#1C1C1E] font-black text-2xl mb-2">Cart is Empty</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              No products added to your quote cart yet.
              Browse our industrial equipment catalog.
            </p>
          </div>
          <button
            onClick={() => navigate("/e-commerceshop")}
            className="w-full flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase tracking-wide px-6 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-[#FFB700]/30"
          >
            <Package size={16} /> Browse Products
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-[#1C1C1E] text-sm font-semibold transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      {/* ══ HEADER STRIP ══ */}
      <div className="bg-[#1C1C1E] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/e-commerceshop")}
              className="flex items-center gap-2 text-gray-400 hover:text-[#FFB700] text-xs font-black uppercase tracking-wide transition-colors"
            >
              <ArrowLeft size={14} /> Shop
            </button>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/")}>Home</span>
              <ChevronRight size={10} />
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/e-commerceshop")}>Shop</span>
              <ChevronRight size={10} />
              <span className="text-[#FFB700] font-black">Quote Cart</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} className="text-[#FFB700]" />
            <span className="text-white font-black text-sm">{totalQty}</span>
            <span className="text-gray-500 text-xs">items</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ══ PAGE TITLE ══ */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#FFB700] rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={22} className="text-[#1C1C1E]" />
          </div>
          <div>
            <h1 className="text-[#1C1C1E] font-black text-2xl md:text-3xl uppercase leading-none">
              Quote Cart
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {cart.length} product{cart.length > 1 ? "s" : ""} · {totalQty} unit{totalQty > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="ml-auto flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ══ LEFT ══ */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">

            {/* ── Cart Items ── */}
            {cart.map((item, index) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#FFB700]/30 hover:shadow-md transition-all duration-200"
              >
                {/* Top accent */}
                <div className="h-0.5 bg-gradient-to-r from-[#FFB700] to-transparent" />

                <div className="p-4 sm:p-5">
                  <div className="flex gap-4">

                    {/* Item number */}
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FFB700]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] font-black text-[#FFB700]">{index + 1}</span>
                    </div>

                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${item.product.id}`)}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F5F5F5] rounded-xl flex-shrink-0 flex items-center justify-center p-2 cursor-pointer hover:bg-[#FFB700]/5 transition-colors"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#FFB700]">
                            {item.product.category.replace(/-/g, " ")}
                          </span>
                          <p
                            onClick={() => navigate(`/product/${item.product.id}`)}
                            className="text-[#1C1C1E] text-sm font-black leading-snug cursor-pointer hover:text-[#FFB700] transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="w-7 h-7 flex-shrink-0 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center transition-all"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {[
                          item.product.material,
                          item.product.capacity,
                          item.product.motorHP,
                          item.product.pressure,
                        ].filter(Boolean).slice(0, 3).map((val) => (
                          <span key={val} className="text-[10px] bg-[#F5F5F5] text-gray-500 font-semibold px-2 py-0.5 rounded-md">
                            {val}
                          </span>
                        ))}
                        <span className="text-[10px] bg-[#F5F5F5] text-gray-400 font-semibold px-2 py-0.5 rounded-md">
                          REVA-{String(item.product.id).padStart(4, "0")}
                        </span>
                      </div>

                      {/* Price + Qty row */}
                      <div className="flex items-center justify-between flex-wrap gap-3 mt-2">

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-[#FFB700] font-black text-lg leading-none">
                            {formatPrice(item.product.price)}
                          </span>
                          <span className="text-gray-300 text-xs line-through">
                            {formatPrice(Math.round(item.product.price * 1.15))}
                          </span>
                        </div>

                        {/* Right: Qty + Line total */}
                        <div className="flex items-center gap-3">

                          {/* Qty */}
                          <div className="flex items-center bg-[#F5F5F5] border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQty(item.product.id, Math.max(1, item.qty - 1))}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-[#1C1C1E]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-10 text-center font-black text-sm text-[#1C1C1E] bg-white border-x border-gray-200 h-8 flex items-center justify-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.product.id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-[#1C1C1E]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">Subtotal</p>
                            <p className="text-[#1C1C1E] font-black text-sm">
                              {formatPrice(item.product.price * item.qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ── Coupon ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#FFB700]/10 rounded-lg flex items-center justify-center">
                  <Tag size={14} className="text-[#FFB700]" />
                </div>
                <span className="text-[#1C1C1E] font-black text-sm uppercase tracking-wide">
                  Promo Code
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setApplied(false); }}
                  placeholder="Enter promo code..."
                  className="flex-1 bg-[#F5F5F5] border border-gray-200 text-sm text-[#1C1C1E] px-4 py-3 rounded-xl outline-none focus:border-[#FFB700] transition-colors placeholder:text-gray-400"
                />
                <button
                  onClick={() => coupon.trim() && setApplied(true)}
                  className={`flex-shrink-0 font-black text-xs uppercase tracking-wide px-5 py-3 rounded-xl transition-all duration-200
                    ${applied
                      ? "bg-green-500 text-white"
                      : "bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white"
                    }`}
                >
                  {applied ? <span className="flex items-center gap-1.5"><CheckCircle size={13} /> Applied</span> : "Apply"}
                </button>
              </div>
              {applied && (
                <p className="text-green-600 text-xs font-black mt-2 flex items-center gap-1.5">
                  <CheckCircle size={12} /> 10% discount applied successfully
                </p>
              )}
            </div>

            {/* ── Delivery Info ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: <Truck size={16} />, label: "Pan India Delivery", sub: "5–7 business days" },
                { icon: <ShieldCheck size={16} />, label: "Quality Assured", sub: "ISO 9001 certified" },
                { icon: <Clock size={16} />, label: "Custom Lead Time", sub: "15–20 days for custom orders" },
              ].map((b) => (
                <div key={b.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-xl flex items-center justify-center text-[#FFB700] flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-[#1C1C1E] font-black text-xs">{b.label}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT: Summary ══ */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            <div className="sticky top-6 flex flex-col gap-4">

              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
                      <span className="text-white font-black text-sm uppercase tracking-wide">
                        Order Summary
                      </span>
                    </div>
                    <BadgeCheck size={18} className="text-[#FFB700]" />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4">

                  {/* Items breakdown */}
                  <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={item.product.image} alt="" className="w-full h-full object-contain p-0.5" />
                        </div>
                        <span className="text-xs text-gray-500 flex-1 truncate">{item.product.name}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[10px] bg-[#FFB700]/10 text-[#FFB700] font-black px-1.5 py-0.5 rounded">
                            ×{item.qty}
                          </span>
                          <span className="text-xs font-black text-[#1C1C1E]">
                            {formatPrice(item.product.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Totals */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Subtotal ({totalQty} units)</span>
                      <span className="font-bold text-[#1C1C1E] text-sm">{formatPrice(subtotal)}</span>
                    </div>
                    {applied && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                          <Tag size={11} /> Promo (10%)
                        </span>
                        <span className="font-bold text-green-600 text-sm">− {formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Shipping</span>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        TBD
                      </span>
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="bg-[#F5F5F5] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[#1C1C1E] font-black text-sm uppercase tracking-wide">
                      Estimated Total
                    </span>
                    <span className="text-[#FFB700] font-black text-2xl">{formatPrice(total)}</span>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed text-center">
                    * Final price varies by customization, qty & delivery location.
                  </p>

                  {/* Submit */}
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase tracking-wide py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#FFB700]/30 hover:-translate-y-0.5"
                  >
                    <Zap size={16} /> Proceed to Checkout
                    <ChevronRight size={15} />
                  </button>


                  {/* Back */}
                  <button
                    onClick={() => navigate("/e-commerceshop")}
                    className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#1C1C1E] text-xs font-black uppercase tracking-wide py-2.5 transition-colors"
                  >
                    <ArrowLeft size={12} /> Continue Shopping
                  </button>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="relative bg-[#1C1C1E] rounded-2xl overflow-hidden p-5">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#FFB700] to-[#FFC933]" />
                <div className="relative flex flex-col gap-3">
                  <div className="w-10 h-10 bg-[#FFB700]/15 border border-[#FFB700]/25 rounded-xl flex items-center justify-center">
                    <Phone size={18} className="text-[#FFB700]" />
                  </div>
                  <div>
                    <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest mb-1">
                      Need Help?
                    </p>
                    <p className="text-white font-black text-base leading-snug">
                      Talk to our <span className="text-[#FFB700]">Engineering</span> Team
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Custom quotes, bulk pricing & technical support.
                    </p>
                  </div>
                  <button className="flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-xs uppercase tracking-wide px-4 py-3 rounded-xl transition-all duration-200">
                    <Phone size={13} /> Call Us Now
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
