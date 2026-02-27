import { useState } from "react";
import { Mail, Send, CheckCircle, Tag, Truck, Bell } from "lucide-react";

// ── Types ──
type Perk = {
  icon: React.ElementType;
  text: string;
};

// ── Perks ──
const perks: Perk[] = [
  { icon: Tag,   text: "Exclusive deals & discounts" },
  { icon: Truck, text: "Free shipping offers" },
  { icon: Bell,  text: "New product alerts" },
];

// ── Main Component ──
const Newsletter = () => {
  const [email, setEmail]       = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError]         = useState<string>("");

  const validateEmail = (val: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
    // hook up your API / mail service here
    console.log("Subscribed:", email);
  };

  return (
    <section className="bg-[#1C1C1E] py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* ══ LEFT: Text Block ══ */}
          <div className="flex flex-col gap-5 flex-1 text-center lg:text-left">

            {/* Icon + Heading */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <div className="w-14 h-14 bg-[#FFB700] rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={28} className="text-[#1C1C1E]" />
              </div>
              <div>
                <p className="text-[#FFB700] text-xs font-black uppercase tracking-widest mb-1">
                  Stay in the loop
                </p>
                <h2 className="text-white font-black text-2xl md:text-3xl uppercase leading-tight">
                  Subscribe to Our{" "}
                  <span className="text-[#FFB700]">Newsletter</span>
                </h2>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
              Join over <span className="text-white font-bold">12,000+</span> subscribers
              and get the latest deals, new arrivals, and exclusive offers delivered
              straight to your inbox.
            </p>

            {/* Perks */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {perks.map(({ icon: Icon, text }: Perk) => (
                <div key={text} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFB700]/10 border border-[#FFB700]/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[#FFB700]" />
                  </div>
                  <span className="text-gray-300 text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT: Form Block ══ */}
          <div className="flex flex-col gap-5 w-full lg:w-auto lg:min-w-[420px]">

            {submitted ? (
              /* ── Success State ── */
              <div className="flex flex-col items-center gap-4 bg-[#2C2C2E] border border-[#FFB700]/30 rounded-xl px-8 py-10 text-center">
                <div className="w-16 h-16 bg-[#FFB700] rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-[#1C1C1E]" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg uppercase">
                    You're subscribed!
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Thanks for joining. Check your inbox for a welcome email.
                  </p>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  className="text-[#FFB700] text-xs font-bold hover:underline transition-colors"
                >
                  Subscribe another email →
                </button>
              </div>
            ) : (
              /* ── Form State ── */
              <div className="bg-[#2C2C2E] border border-[#2C2C2E] hover:border-[#FFB700]/30 rounded-xl p-6 md:p-8 transition-colors duration-300">

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                  {/* Name input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      className="w-full bg-[#1C1C1E] border border-[#3C3C3E] text-white text-sm px-4 py-3 rounded-lg outline-none placeholder:text-gray-600 focus:border-[#FFB700] transition-colors duration-200"
                    />
                  </div>

                  {/* Email input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">
                      Email Address <span className="text-[#FFB700]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="you@example.com"
                      className={`w-full bg-[#1C1C1E] border text-white text-sm px-4 py-3 rounded-lg outline-none placeholder:text-gray-600 focus:border-[#FFB700] transition-colors duration-200
                        ${error ? "border-red-500" : "border-[#3C3C3E]"}`}
                    />
                    {/* Error */}
                    {error && (
                      <p className="text-red-400 text-xs font-medium">{error}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#FFB700] hover:bg-[#FFC933] active:bg-[#CC9200] text-[#1C1C1E] font-black text-sm uppercase tracking-wide py-3.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#FFB700]/20 mt-1"
                  >
                    <Send size={15} />
                    Subscribe Now
                  </button>

                  {/* Privacy note */}
                  <p className="text-gray-600 text-xs text-center leading-relaxed">
                    No spam, ever. Unsubscribe at any time.{" "}
                    <a href="/privacy" className="text-gray-500 hover:text-[#FFB700] transition-colors underline underline-offset-2">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
