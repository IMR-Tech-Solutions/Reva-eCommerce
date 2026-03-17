// frontend/src/ecommerce-pages/pages/CheckoutPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useSelector } from "react-redux";
import api from "../../services/baseapi";
import { toast } from "react-toastify";
import {
  ArrowLeft, ChevronRight, CheckCircle,
  ShieldCheck, Truck, Phone, User,
  MapPin, Mail, Building2, FileText,
  Zap, Package, BadgeCheck, ChevronDown,
} from "lucide-react";

const formatPrice = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// ── Reusable Input ──
const Field = ({
  label, placeholder, type = "text", required = false, icon, name, value, onChange, error
}: {
  label: string; placeholder: string; type?: string; required?: boolean; icon?: React.ReactNode;
  name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-[#1C1C1E]">
      {label} {required && <span className="text-[#FFB700]">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${error ? "text-red-500" : "text-gray-400"}`}>
          {icon}
        </div>
      )}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`w-full bg-[#F5F5F5] border text-[#1C1C1E] text-sm py-3 rounded-xl outline-none focus:bg-white transition-all placeholder:text-gray-400 
          ${error ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]" : "border-gray-200 focus:border-[#FFB700] shadow-none"}
          ${icon ? "pl-10 pr-4" : "px-4"}`}
      />
    </div>
  </div>
);

// ── Reusable Select ──
const SelectField = ({
  label, options, required = false, name, value, onChange, error
}: {
  label: string; options: string[]; required?: boolean;
  name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-[#1C1C1E]">
      {label} {required && <span className="text-[#FFB700]">*</span>}
    </label>
    <div className="relative">
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full appearance-none bg-[#F5F5F5] border text-[#1C1C1E] text-sm px-4 py-3 pr-10 rounded-xl outline-none focus:bg-white cursor-pointer transition-all
          ${error ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]" : "border-gray-200 focus:border-[#FFB700] shadow-none"}`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${error ? "text-red-500" : "text-gray-400"}`} />
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useSelector((state: any) => state.user);
  const [payMethod, setPayMethod] = useState<"bank_transfer" | "upi" | "card">("bank_transfer");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "India",
    notes: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.mobile_number || "",
        city: user.city || "",
        state: user.state || "",
        zipcode: user.postal_code || "",
        country: user.country || "India"
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isAuthenticated) {
      toast.warning("Please login to place an order");
      navigate("/accounts?redirect=/checkout");
      return;
    }

    const requiredFields = ["firstName", "lastName", "email", "phone", "address1", "city", "state", "zipcode", "country"];
    const newErrors: Record<string, boolean> = {};
    let hasError = false;

    requiredFields.forEach(f => {
      if (!formData[f as keyof typeof formData]) {
        newErrors[f] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setFieldErrors(newErrors);
      toast.error("Please fill required fields");
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const orderData = {
        address: `${formData.address1}${formData.address2 ? ", " + formData.address2 : ""}`,
        city: formData.city,
        zipcode: formData.zipcode,
        payment_method: payMethod,
        notes: formData.notes,
      };

      const res = await api.post("ecommerce/checkout/", orderData);
      setOrderInfo(res.data.order);
      setSubmitted(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err: any) {
      console.error("Order failed", err);
      const errorData = err.response?.data;
      const errMsg = errorData?.error || "Failed to place order.";
      const details = errorData?.details;

      if (details) {
        // details can be a list or a string
        const detailedMsg = Array.isArray(details) ? details.join(", ") : details;
        toast.error(`${errMsg}: ${detailedMsg}`);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-[#1C1C1E] px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <span className="text-[#FFB700] font-black text-xs uppercase tracking-wide">Order Confirmed</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-6 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div>
              <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest mb-2">
                Quote Placed Successfully
              </p>
              <h2 className="text-[#1C1C1E] font-black text-2xl mb-2">Order Confirmed!</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our engineering team will review your request and contact you within{" "}
                <span className="font-black text-[#1C1C1E]">24–48 hours</span>.
              </p>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-xl p-4 flex flex-col gap-2.5">
              {[
                { label: "Order ID", val: orderInfo?.order_number || `#REVA-${Date.now().toString().slice(-6)}` },
                { label: "Total Amount", val: formatPrice(Number(orderInfo?.total_amount || 0)) },
                { label: "Items", val: `${orderInfo?.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0} units` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="font-black text-[#1C1C1E]">{r.val}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/")}
              className="mt-4 text-[#FFB700] font-black text-xs uppercase tracking-widest hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      <div className="bg-[#1C1C1E] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-gray-400 hover:text-[#FFB700] text-xs font-black uppercase tracking-wide transition-colors"
            >
              <ArrowLeft size={14} /> Cart
            </button>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/")}>Home</span>
              <ChevronRight size={10} />
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/cart")}>Cart</span>
              <ChevronRight size={10} />
              <span className="text-[#FFB700] font-black">Checkout</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-wide">
            <span className="flex items-center gap-1 text-gray-600">
              <CheckCircle size={11} className="text-green-500" /> Cart
            </span>
            <ChevronRight size={10} className="text-gray-700" />
            <span className="flex items-center gap-1.5 text-[#FFB700]">
              <span className="w-4 h-4 bg-[#FFB700] rounded-full flex items-center justify-center text-[#1C1C1E] text-[9px] font-black">2</span>
              Checkout
            </span>
            <ChevronRight size={10} className="text-gray-700" />
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-[9px] font-black">3</span>
              Confirm
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#FFB700] rounded-2xl flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-[#1C1C1E]" />
          </div>
          <div>
            <h1 className="text-[#1C1C1E] font-black text-2xl md:text-3xl uppercase leading-none">
              Checkout
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Fill in your details to submit the quote request
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1C1C1E] px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
                <span className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <User size={14} /> Contact Information
                </span>
                <span className="ml-auto bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-2 py-0.5 rounded-full">
                  Step 1
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Rajesh" required icon={<User size={14} />} error={fieldErrors.firstName} />
                  <Field label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Sharma" required icon={<User size={14} />} error={fieldErrors.lastName} />
                  <Field label="Email Address" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@company.com" required type="email" icon={<Mail size={14} />} error={fieldErrors.email} />
                  <Field label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" required type="tel" icon={<Phone size={14} />} error={fieldErrors.phone} />
                  <Field label="Company Name" name="company" value={formData.company} onChange={handleInputChange} placeholder="e.g. Reva Engineering" icon={<Building2 size={14} />} />
                  <Field label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g. Procurement Manager" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1C1C1E] px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
                <span className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <MapPin size={14} /> Shipping Address
                </span>
                <span className="ml-auto bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-2 py-0.5 rounded-full">
                  Step 2
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Address Line 1" name="address1" value={formData.address1} onChange={handleInputChange} placeholder="Building / Plot / Street" required icon={<MapPin size={14} />} error={fieldErrors.address1} />
                  </div>
                  <Field label="Address Line 2" name="address2" value={formData.address2} onChange={handleInputChange} placeholder="Area / Landmark" />
                  <Field label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Pune" required error={fieldErrors.city} />
                  <SelectField
                    label="State" required name="state" value={formData.state} onChange={handleInputChange} error={fieldErrors.state}
                    options={["Maharashtra", "Gujarat", "Rajasthan", "Tamil Nadu", "Karnataka", "Delhi", "Uttar Pradesh", "West Bengal", "Telangana", "Andhra Pradesh"]}
                  />
                  <Field label="PIN Code" name="zipcode" value={formData.zipcode} onChange={handleInputChange} placeholder="e.g. 411001" required type="number" error={fieldErrors.zipcode} />
                  <SelectField
                    label="Country" required name="country" value={formData.country} onChange={handleInputChange} error={fieldErrors.country}
                    options={["India", "UAE", "Saudi Arabia", "Bangladesh", "Nepal"]}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1C1C1E] px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
                <span className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <FileText size={14} /> Order Notes
                </span>
                <span className="ml-auto bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-2 py-0.5 rounded-full">
                  Step 3
                </span>
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Special Requirements / Notes
                  </label>
                  <textarea
                    rows={4}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Custom dimensions, special material grade, delivery preferences, installation support..."
                    className="w-full bg-[#F5F5F5] border border-gray-200 text-[#1C1C1E] text-sm px-4 py-3 rounded-xl outline-none focus:border-[#FFB700] focus:bg-white transition-all placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1C1C1E] px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
                <span className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <BadgeCheck size={14} /> Payment Preference
                </span>
                <span className="ml-auto bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-2 py-0.5 rounded-full">
                  Step 4
                </span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { key: "bank_transfer", label: "Bank Transfer", sub: "NEFT / RTGS / IMPS" },
                    { key: "upi", label: "UPI Payment", sub: "GPay / PhonePe / BHIM" },
                    { key: "card", label: "Card Payment", sub: "Debit / Credit Card" },
                  ] as const).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPayMethod(m.key)}
                      className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${payMethod === m.key
                          ? "border-[#FFB700] bg-[#FFB700]/5"
                          : "border-gray-200 bg-[#F5F5F5] hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#1C1C1E] font-black text-xs">{m.label}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${payMethod === m.key ? "border-[#FFB700] bg-[#FFB700]" : "border-gray-300"}`}>
                          {payMethod === m.key && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">{m.sub}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  * Payment details will be shared after quote confirmation by our team.
                </p>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6 flex flex-col gap-4">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#1C1C1E] px-5 py-3.5 flex items-center gap-2.5">
                  <div className="w-1 h-5 bg-[#FFB700] rounded-full" />
                  <span className="text-white font-black text-sm uppercase tracking-wide">
                    Order Summary
                  </span>
                  <span className="ml-auto bg-[#FFB700] text-[#1C1C1E] text-[10px] font-black px-2 py-0.5 rounded-full">
                    {totalQty} units
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-4">

                  <div className="flex flex-col gap-3 max-h-52 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                          <img src={item.product.image as string} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-[#1C1C1E] truncate">{item.product.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {formatPrice(item.product.price)} × {item.qty}
                          </p>
                        </div>
                        <span className="text-xs font-black text-[#1C1C1E] flex-shrink-0">
                          {formatPrice(item.product.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-[#1C1C1E]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">GST (18%)</span>
                      <span className="font-bold text-[#1C1C1E]">{formatPrice(gst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">TBD</span>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Grand Total</p>
                      <p className="text-[9px] text-gray-400">incl. 18% GST</p>
                    </div>
                    <span className="text-[#FFB700] font-black text-2xl">{formatPrice(total)}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm uppercase tracking-wide py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#FFB700]/30 hover:-translate-y-0.5 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap size={16} /> Place Quote Order
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate("/cart")}
                    className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#1C1C1E] text-xs font-black uppercase tracking-wide py-2 transition-colors"
                  >
                    <ArrowLeft size={12} /> Back to Cart
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                {[
                  { icon: <ShieldCheck size={14} />, label: "SSL Secure Checkout", sub: "256-bit encryption" },
                  { icon: <Truck size={14} />, label: "Pan India Delivery", sub: "5–7 business days" },
                  { icon: <Phone size={14} />, label: "Engineering Support", sub: "24/7 expert assistance" },
                  { icon: <Package size={14} />, label: "Safe Packaging", sub: "No transit damage" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-lg flex items-center justify-center text-[#FFB700] flex-shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-[#1C1C1E] font-black text-[11px]">{b.label}</p>
                      <p className="text-gray-400 text-[10px]">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative bg-[#1C1C1E] rounded-2xl overflow-hidden p-5">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />
                <div className="absolute left-0 top-0 h-full w-1 bg-[#FFB700]" />
                <div className="relative flex flex-col gap-3">
                  <div className="w-10 h-10 bg-[#FFB700]/15 border border-[#FFB700]/25 rounded-xl flex items-center justify-center">
                    <Phone size={18} className="text-[#FFB700]" />
                  </div>
                  <div>
                    <p className="text-[#FFB700] text-[10px] font-black uppercase tracking-widest mb-1">Need Help?</p>
                    <p className="text-white font-black text-base leading-snug">
                      Talk to our <span className="text-[#FFB700]">Engineering</span> Team
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Custom quotes & bulk pricing.</p>
                  </div>
                  <button className="flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-black text-xs uppercase tracking-wide px-4 py-3 rounded-xl transition-all">
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

export default CheckoutPage;
