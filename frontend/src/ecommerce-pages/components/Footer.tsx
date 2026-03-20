import {
  Facebook, Instagram, Linkedin, Twitter, Youtube,
  Mail, Phone, ArrowUp,
  Truck, ShieldCheck, RefreshCcw, LayoutGrid,
  MessageCircle
} from "lucide-react";
import { ecommerceLinks } from "../ecommerceRoutes";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const infoLinks = [
    { label: "About us", href: "/about" },
    { label: "Delivery Information", href: "/delivery" },
    { label: "Privacy Policy", href: ecommerceLinks.PrivacyPolicy },

    { label: "Terms & Conditions", href: ecommerceLinks.TermsAndConditions },
  ];

  const accountLinks = [
    { label: "My account", href: ecommerceLinks.Account },

    { label: "My Orders", href: ecommerceLinks.AccountOrder },
    { label: "Returns", href: "/returns" },
    { label: "Shipping", href: ecommerceLinks.Shipping },
  ];



  const offers = [
    { icon: Truck, title: "Free delivery", sub: "Worldwide from $27" },
    { icon: ShieldCheck, title: "Warranty", sub: "Up to 2 years" },
    { icon: RefreshCcw, title: "Easy return", sub: "365 days return" },
    { icon: LayoutGrid, title: "Wide choice", sub: "100k items available" },
  ];

  const socials = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const payments = [
    { label: "Apple Pay", bg: "bg-black", text: "text-white" },
    { label: "G Pay", bg: "bg-white", text: "text-gray-800" },
    { label: "MC", bg: "bg-red-600", text: "text-white" },
    { label: "PayPal", bg: "bg-[#FFB700]", text: "text-white" },
    { label: "PayPal Credit", bg: "bg-blue-500", text: "text-white" },
    { label: "VISA", bg: "bg-blue-900", text: "text-[#FFB700]" },
    { label: "AMEX", bg: "bg-sky-700", text: "text-white" },
  ];

  return (
    <footer className="w-full">

      {/* ══ OFFERS BAR — primary yellow ══ */}
      <div className="bg-[#FFB700] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-y-3 gap-x-6">

          <span className="font-black text-[#1C1C1E] text-xl uppercase tracking-wide whitespace-nowrap mr-2">
            REVA <br></br> OFFERS:
          </span>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 flex-1 justify-between">
            {offers.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 flex-shrink-0">
                <Icon size={30} strokeWidth={1.5} className="text-[#1C1C1E] flex-shrink-0" />
                <div className="leading-tight">
                  <p className="font-black text-[#1C1C1E] text-sm">{title}</p>
                  <p className="text-[#1C1C1E]/70 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ══ MAIN FOOTER — secondary dark ══ */}
      <div className="bg-[#1C1C1E] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-10">

            {/* ── Col 1: Logo + Social + Address ── */}
            <div className="flex flex-col gap-5">
              <a href="/" className="inline-block">
                <img
                  src="/ecommerce-images/logo.png"
                  alt="Logo"
                  className="h-20 w-auto object-contain brightness-0 invert"
                />
              </a>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-full bg-[#2C2C2E] hover:bg-[#FFB700] text-gray-400 hover:text-[#1C1C1E] flex items-center justify-center transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>

              {/* Address */}
              <div className="mt-1">
                <p className="text-gray-500 text-sm leading-relaxed">
                  17 Antares Place, Mairangi<br />Bay, Auckland 0632
                </p>
              </div>
            </div>

            {/* ── Col 2: Information ── */}
            <div>
              <h4 className="text-[#FFB700] font-black text-sm mb-5 uppercase tracking-wide">
                Information
              </h4>
              <ul className="flex flex-col gap-3">
                {infoLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-gray-500 hover:text-[#FFB700] text-sm transition-colors duration-150"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 3: Account ── */}
            <div>
              <h4 className="text-[#FFB700] font-black text-sm mb-5 uppercase tracking-wide">
                Account
              </h4>
              <ul className="flex flex-col gap-3">
                {accountLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-gray-500 hover:text-[#FFB700] text-sm transition-colors duration-150"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>


            {/* ── Col 5: Need Help ── */}
            <div className="flex flex-col gap-4">
              <p className="text-white text-sm">
                <span className="font-black">Need help?</span>
                <span className="text-gray-500 font-normal"> / Quick contacts</span>
              </p>

              {/* Phone */}
              <a href="tel:01419504018" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-[#FFB700] group-hover:bg-[#FFC933] rounded flex items-center justify-center flex-shrink-0 transition-colors">
                  <Phone size={17} className="text-[#1C1C1E]" />
                </div>
                <span className="text-[#FFB700] font-black text-xl tracking-wide">
                  0141 950 4018
                </span>
              </a>

              {/* Hours */}
              <div className="text-gray-500 text-xs flex flex-col gap-1 leading-relaxed">
                <p>Monday – Friday: 9:00 – 20:00</p>
                <p>Saturday: 10:00 – 15:00</p>
              </div>

              {/* Quick Contact Icons */}
              <div className="flex items-center gap-2 mt-1">
                <button aria-label="Email"
                  className="w-9 h-9 bg-[#2C2C2E] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-white rounded flex items-center justify-center transition-colors">
                  <Mail size={15} />
                </button>
                <button aria-label="Messenger"
                  className="w-9 h-9 bg-[#2C2C2E] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-white rounded flex items-center justify-center transition-colors">
                  <MessageCircle size={15} />
                </button>
                <button aria-label="Viber"
                  className="w-9 h-9 bg-[#2C2C2E] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-white rounded flex items-center justify-center transition-colors">
                  <Phone size={15} />
                </button>
                <button aria-label="WhatsApp"
                  className="w-9 h-9 bg-[#2C2C2E] hover:bg-[#FFB700] hover:text-[#1C1C1E] text-white rounded flex items-center justify-center transition-colors">
                  <MessageCircle size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="bg-[#0F0F10] border-t border-[#2C2C2E] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright + Legal */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 justify-center sm:justify-start">
            <span>© {currentYear} My Site. All rights reserved.</span>
            <span className="text-[#2C2C2E]">|</span>
            <a href="/terms" className="hover:text-[#FFB700] transition-colors">Terms and Conditions</a>
            <span className="text-[#2C2C2E]">|</span>
            <a href="/privacy" className="hover:text-[#FFB700] transition-colors">Privacy Policy</a>
            <span className="text-[#2C2C2E]">|</span>
            <a href="/sitemap" className="hover:text-[#FFB700] transition-colors">Sitemap</a>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {payments.map(({ label, bg, text }) => (
              <span
                key={label}
                className={`${bg} ${text} text-[9px] font-black px-2.5 py-1.5 rounded min-w-[42px] text-center`}
              >
                {label}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ══ BACK TO TOP ══ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Back to top"
      >
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>

    </footer>
  );
};

export default Footer;
