import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { CATEGORIES } from "../data/categories";
import { useCart } from "../context/CartContext";
import {
  Menu, X, ShoppingCart, User, Search,
  MapPin, Phone, ChevronDown, Globe, ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blogs" },
  { label: "Shop", href: "/e-commerceshop" },
  { label: "Categories", href: "/category" },
  { label: "Contact Us", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, cart } = useCart();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [scrolledCatOpen, setScrolledCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const scrolledCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node))
        setCategoryOpen(false);
      if (scrolledCategoryDropdownRef.current && !scrolledCategoryDropdownRef.current.contains(e.target as Node))
        setScrolledCatOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
    setCategoryOpen(false);
    setScrolledCatOpen(false);
    setMobileCatOpen(false);
    setMenuOpen(false);
  };

  // Cart Dropdown Component
  const CartDropdownComponent = () => (
    <div className="absolute top-[120%] right-0 mt-1 w-80 bg-white shadow-2xl rounded-lg border border-gray-100 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-full transition-all duration-300 before:absolute before:-top-1.5 before:right-6 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-gray-100 cursor-default">
      <div className="p-4 bg-white rounded-lg relative z-10 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
          My Cart ({cartCount} items)
        </h3>

        {cart.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded shadow-sm border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate" title={item.product.name}>{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.qty} × ₹{item.product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-sm font-bold text-[#1C1C1E]">
                    ₹{(item.product.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                <span className="text-sm font-bold text-[#1C1C1E]">
                  ₹{cart.reduce((total, item) => total + item.product.price * item.qty, 0).toLocaleString()}
                </span>
              </div>
              <a
                href="/cart"
                className="w-full py-2.5 text-center text-sm font-bold text-[#1C1C1E] bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                onClick={(e) => { e.stopPropagation(); }}
              >
                View Full Cart
              </a>
              <a
                href="/checkout"
                className="w-full py-2.5 text-center text-sm font-bold text-[#1C1C1E] bg-[#FFB700] hover:bg-[#FFC933] rounded transition-colors"
                onClick={(e) => { e.stopPropagation(); }}
              >
                Proceed to Checkout
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Shared category dropdown list
  const CategoryList = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg mt-2 w-56 z-[100] border border-gray-100 max-h-80 overflow-y-auto">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => { handleCategoryClick(cat.slug); onClose(); }}
          className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#FFB700] transition-colors"
        >
          {cat.name}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP FULL HEADER — not sticky, scrolls away
      ══════════════════════════════════════════ */}
      <header className="w-full hidden md:block">

        {/* ── TOP BAR (dark) ── */}
        <div className="bg-[#1C1C1E] text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4">

            {/* Logo */}
            <a href="/" className="flex-shrink-0 flex items-center group">
              <img
                src="/ecommerce-images/logo.png"
                alt="Logo"
                className="h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </a>

            {/* Search */}
            <div className="flex-1 mx-4 max-w-2xl">
              <div className="flex items-center rounded-lg overflow-hidden border-2 border-transparent focus-within:border-[#FFB700] transition-colors duration-200 bg-[#2C2C2E]">
                <select className="bg-[#2C2C2E] text-gray-300 text-sm px-3 py-3 border-r border-[#3C3C3E] outline-none cursor-pointer hover:bg-[#3C3C3E] transition-colors flex-shrink-0">
                  <option>All</option>
                  <option>Products</option>
                  <option>Brands</option>
                </select>
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  className="flex-1 bg-white text-gray-800 text-sm px-4 py-3 outline-none min-w-0"
                />
                <button className="bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-bold px-5 py-3 transition-colors flex items-center gap-1.5 flex-shrink-0">
                  <Search size={16} />
                  <span className="text-sm font-bold">Search</span>
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0 ml-auto">
              <button className="flex items-start gap-2.5 group text-left">
                <MapPin size={20} className="text-[#FFB700] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-extrabold text-[#FFB700] text-sm uppercase tracking-wide leading-tight">Locations</p>
                  <p className="text-white text-sm font-medium group-hover:text-[#FFC933] transition-colors leading-tight mt-0.5">Find a store</p>
                </div>
              </button>
              <div className="w-px h-10 bg-[#2C2C2E]" />
              <div className="flex items-start gap-2.5">
                <Phone size={20} className="text-[#FFB700] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-[#FFB700] text-sm uppercase tracking-wide leading-tight">833-474-8531</p>
                  <p className="text-white text-sm font-medium leading-tight mt-0.5">Sales & Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP NAV BAR (yellow) ── */}
        <div className="bg-[#FFB700] px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-2">

            {/* Category dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryOpen((prev) => !prev)}
                className={`flex items-center gap-2.5 text-sm font-black uppercase tracking-wide px-5 py-2.5 rounded transition-all duration-200
                  ${categoryOpen ? "bg-[#FFB700] text-[#1C1C1E]" : "bg-[#1C1C1E] text-white hover:bg-white hover:text-[#1C1C1E]"}`}
              >
                <div className="flex flex-col gap-[4px] w-4 flex-shrink-0">
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-200 ${categoryOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-200 ${categoryOpen ? "opacity-0 scale-x-0" : ""}`} />
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-200 ${categoryOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
                </div>
                <span>Shop by Category</span>
                <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
              </button>
              {categoryOpen && <CategoryList onClose={() => setCategoryOpen(false)} />}
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={href} href={href}
                  className="px-3.5 py-2 text-sm font-bold text-[#1C1C1E] hover:text-white rounded hover:bg-[#CC9200] transition-colors">
                  {label}
                </a>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <a href="/account" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#1C1C1E] hover:text-white hover:bg-[#CC9200] rounded transition-colors">
                <User size={16} />
                <span className="hidden lg:inline">Account</span>
              </a>
              <div className="relative group">
                <a href="/cart" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#1C1C1E] hover:text-white hover:bg-[#CC9200] rounded transition-colors">
                  <ShoppingCart size={16} />
                  <span className="hidden lg:inline">Cart</span>
                  <span className="bg-[#1C1C1E] group-hover:bg-white group-hover:text-[#1C1C1E] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 transition-colors">{cartCount}</span>
                </a>
                <CartDropdownComponent />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          DESKTOP STICKY COMPACT BAR
          — hidden until scrolled past 80px
          — slides in from top with animation
      ══════════════════════════════════════════ */}
      <div
        className={`hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#FFB700] shadow-2xl
          transition-transform duration-300 ease-in-out
          ${scrolled ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3 px-4 py-2.5">

          {/* Logo (compact) */}
          <a href="/" className="flex-shrink-0">
            <img src="/ecommerce-images/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
          </a>

          {/* Category dropdown */}
          <div className="relative flex-shrink-0" ref={scrolledCategoryDropdownRef}>
            <button
              onClick={() => setScrolledCatOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-black uppercase tracking-wide bg-[#1C1C1E] text-white hover:bg-white hover:text-[#1C1C1E] px-4 py-2.5 rounded transition-all duration-200 whitespace-nowrap"
            >
              <ChevronDown size={14} className={`transition-transform duration-200 ${scrolledCatOpen ? "rotate-180" : ""}`} />
              Shop by Category
            </button>
            {scrolledCatOpen && <CategoryList onClose={() => setScrolledCatOpen(false)} />}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center rounded-lg overflow-hidden border-2 border-transparent focus-within:border-[#1C1C1E] bg-white transition-colors">
              <select className="bg-white text-gray-600 text-sm px-3 py-2.5 border-r border-gray-200 outline-none cursor-pointer flex-shrink-0">
                <option>Category</option>
                <option>Products</option>
                <option>Brands</option>
              </select>
              <input
                type="text"
                placeholder="Enter a keyword to search products"
                className="flex-1 bg-white text-gray-800 text-sm px-4 py-2.5 outline-none min-w-0"
              />
              <button className="bg-[#FFB700] hover:bg-[#FFC933] border-l-2 border-[#CC9200] text-[#1C1C1E] font-bold px-5 py-2.5 transition-colors flex items-center gap-1.5 flex-shrink-0">
                <Search size={15} />
                <span className="text-sm font-bold">Search</span>
              </button>
            </div>
          </div>

          {/* Account + Cart */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <a href="/account" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#1C1C1E] hover:text-white hover:bg-[#CC9200] rounded transition-colors whitespace-nowrap">
              <User size={16} />
              <span>My Account</span>
            </a>
            <div className="relative group">
              <a href="/cart" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#1C1C1E] hover:text-white hover:bg-[#CC9200] rounded transition-colors whitespace-nowrap">
                <ShoppingCart size={16} />
                <span>Cart ({cartCount})</span>
              </a>
              <CartDropdownComponent />
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE TOP BAR — sticky
      ══════════════════════════════════════════ */}
      <div className={`md:hidden bg-[#FFB700] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-2xl" : "shadow-md"}`}>
        <a href="/" className="flex-shrink-0">
          <img src="/ecommerce-images/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
        </a>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded hover:bg-[#CC9200] transition-colors text-[#1C1C1E]"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <a href="/cart" className="relative p-2 rounded hover:bg-[#CC9200] transition-colors text-[#1C1C1E]">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded hover:bg-[#CC9200] transition-colors text-[#1C1C1E]"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile search dropdown */}
      <div className={`md:hidden bg-[#1C1C1E] overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg overflow-hidden border-2 border-transparent focus-within:border-[#FFB700] bg-[#2C2C2E]">
            <input
              type="text"
              placeholder="Search products, brands..."
              className="flex-1 bg-white text-gray-800 text-sm px-4 py-2.5 outline-none"
              autoFocus={searchOpen}
            />
            <button className="bg-[#FFB700] hover:bg-[#FFC933] text-[#1C1C1E] font-bold px-4 py-2.5 transition-colors">
              <Search size={15} />
            </button>
          </div>
          <button onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── SIDEBAR OVERLAY ── */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── SIDEBAR DRAWER ── */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1C1C1E] text-white z-[60] md:hidden
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="bg-[#FFB700] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <a href="/" onClick={() => setMenuOpen(false)}>
            <img src="/ecommerce-images/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
          </a>
          <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded hover:bg-[#CC9200] transition-colors text-[#1C1C1E]" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#2C2C2E]">
            <button
              onClick={() => setMobileCatOpen((prev) => !prev)}
              className="w-full flex items-center justify-between bg-[#FFB700] text-[#1C1C1E] font-bold text-sm px-4 py-3 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <Menu size={15} />
                Shop by Category
              </div>
              <ChevronDown size={14} className={`opacity-70 transition-transform duration-200 ${mobileCatOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileCatOpen && (
              <div className="mt-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg max-h-72 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <button key={cat.slug} onClick={() => handleCategoryClick(cat.slug)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-[#2C2C2E] hover:text-[#FFB700] transition-colors">
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-3 py-3 flex flex-col gap-0.5">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest px-3 mb-2">Navigation</p>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:bg-[#2C2C2E] hover:text-[#FFB700] transition-colors group"
                onClick={() => setMenuOpen(false)}
              >
                <ChevronRight size={14} className="text-[#FFB700] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-[#2C2C2E] px-4 py-3 flex items-center justify-between flex-shrink-0 bg-[#0F0F10]">
          <span className="text-gray-500 text-xs">© 2026 My Website</span>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#FFB700] text-xs transition-colors">
            <Globe size={13} />
            Language
          </button>
        </div>
      </div>
    </>
  );
}
