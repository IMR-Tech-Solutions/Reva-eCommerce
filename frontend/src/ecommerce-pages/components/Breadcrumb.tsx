import { useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

// ── ONE image for all pages — change this only ──
const GLOBAL_BG_IMAGE = "/ecommerce-images/slide1.jpg";

// ── Route config ──
const ROUTE_META: Record<string, { label: string; subtitle?: string }> = {
  shop:                      { label: "Shop",                  subtitle: "Browse our full range of products."                },
  brands:                    { label: "Shop by Brand",         subtitle: "Explore products from top industry brands."        },
  blog:                      { label: "Blog",                  subtitle: "Latest offers, promos and industry news."          },
  elements:                  { label: "Elements",              subtitle: "UI components and design elements."                },
  features:                  { label: "Features",              subtitle: "Discover everything our platform offers."          },
  account:                   { label: "My Account",            subtitle: "Manage your orders, wishlist and settings."        },
  cart:                      { label: "Cart",                  subtitle: "Review your selected items before checkout."       },
  wishlist:                  { label: "Wishlist",              subtitle: "Your saved products."                              },
  orders:                    { label: "My Orders",             subtitle: "Track and manage your past orders."                },
  about:                     { label: "About Us",              subtitle: "Learn more about our company and mission."         },
  contact:                   { label: "Contact",               subtitle: "Get in touch with our team."                      },
  privacy:                   { label: "Privacy Policy",        subtitle: "How we handle your data."                         },
  terms:                     { label: "Terms & Conditions",    subtitle: "Our terms of service."                            },
  delivery:                  { label: "Delivery Information",  subtitle: "Shipping rates, timelines and tracking."          },

  // ── Category slugs ──
  "reactors":                 { label: "Reactors",                  subtitle: "Industrial-grade reactor equipment."          },
  "heat-transfer-equipment":  { label: "Heat Transfer Equipment",   subtitle: "Precision heat exchange solutions."           },
  "separation-equipment":     { label: "Separation Equipment",      subtitle: "High-performance separation systems."         },
  "fluid-handling-equipment": { label: "Fluid Handling Equipment",  subtitle: "Pumps, valves and flow control systems."      },
  "size-reduction-equipment": { label: "Size Reduction Equipment",  subtitle: "Crushers, mills and grinding machinery."      },
  "mixing-equipment":         { label: "Mixing Equipment",          subtitle: "Industrial mixers and blending systems."      },
};

// ── Format raw slug → readable label ──
const formatSegment = (segment: string): string =>
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

// ── Main Component ──
const Breadcrumb = () => {
  const { pathname } = useLocation();

  if (pathname === "/") return null;

  const segments    = pathname.split("/").filter(Boolean);
  const crumbs      = segments.map((seg: string, i: number) => ({
    slug:  seg,
    label: ROUTE_META[seg]?.label || formatSegment(seg),
    href:  "/" + segments.slice(0, i + 1).join("/"),
  }));

  const currentSlug = segments[segments.length - 1];
  const meta        = ROUTE_META[currentSlug];
  const title       = meta?.label    || formatSegment(currentSlug);
  const subtitle    = meta?.subtitle || undefined;

  return (
    <div className="relative w-full min-h-[180px] md:min-h-[220px] flex items-center overflow-hidden">

      {/* ── Single Global BG Image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${GLOBAL_BG_IMAGE})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#1C1C1E]/80" />

      {/* Left Yellow Accent */}
      <div className="absolute left-0 top-0 h-full w-1 bg-[#FFB700]" />

      {/* Dot Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, #FFB700 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col gap-3">

        {/* Title */}
        <h1 className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight leading-tight">
          {title.split(" ").map((word: string, i: number) =>
            i === 0
              ? <span key={i} className="text-[#FFB700]">{word} </span>
              : <span key={i}>{word} </span>
          )}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap mt-1">

          <a
            href="/"
            className="flex items-center gap-1 text-gray-400 hover:text-[#FFB700] text-xs font-semibold transition-colors duration-200"
          >
            <Home size={12} />
            <span>Home</span>
          </a>

          {crumbs.map((crumb, index: number) => {
            const isLast = index === crumbs.length - 1;
            return (
              <div key={crumb.slug} className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-[#FFB700]/50 flex-shrink-0" />
                {isLast ? (
                  <span className="text-[#FFB700] font-black text-xs uppercase tracking-wide">
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={crumb.href}
                    className="text-gray-400 hover:text-[#FFB700] text-xs font-semibold transition-colors duration-200"
                  >
                    {crumb.label}
                  </a>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Yellow Border */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FFB700] via-[#FFB700]/50 to-transparent" />
    </div>
  );
};

export default Breadcrumb;
