import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

// ── Types ──
type Testimonial = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
  date: string;
};

// ── Data — 6 reviews ──
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "James Mitchell",
    role: "Professional Contractor",
    avatar: "/ecommerce-images/avatar1.jpg",
    rating: 5,
    review:
      "Absolutely outstanding quality tools. The DEWALT set I ordered arrived quickly and exceeded my expectations. Will definitely be ordering again!",
    date: "Jan 12, 2026",
  },
  {
    id: 2,
    name: "Sarah Thompson",
    role: "DIY Enthusiast",
    avatar: "/ecommerce-images/avatar2.jpg",
    rating: 4,
    review:
      "Great selection and very competitive prices. Delivery was fast and the packaging was secure. My Bosch drill is working perfectly.",
    date: "Jan 28, 2026",
  },
  {
    id: 3,
    name: "Robert Clarke",
    role: "Site Manager",
    avatar: "/ecommerce-images/avatar3.jpg",
    rating: 5,
    review:
      "I've been buying tools from here for 2 years now. Always reliable, always genuine products. The Milwaukee range is fantastic value.",
    date: "Feb 3, 2026",
  },
  {
    id: 4,
    name: "Emily Watson",
    role: "Home Renovator",
    avatar: "/ecommerce-images/avatar4.jpg",
    rating: 5,
    review:
      "The customer service team was incredibly helpful when I needed advice on which air compressor to choose. Highly recommend!",
    date: "Feb 10, 2026",
  },
  {
    id: 5,
    name: "David Harris",
    role: "Electrician",
    avatar: "/ecommerce-images/avatar5.jpg",
    rating: 4,
    review:
      "Good range of professional tools at fair prices. The Klein Tools plier set is exactly what I needed for the job. Fast shipping too.",
    date: "Feb 14, 2026",
  },
  {
    id: 6,
    name: "Lisa Patterson",
    role: "Workshop Owner",
    avatar: "/ecommerce-images/avatar6.jpg",
    rating: 5,
    review:
      "Stocked up on safety equipment and power tools for my workshop. Everything was exactly as described and arrived well within the estimated time.",
    date: "Feb 20, 2026",
  },
];

// ── Duplicate for infinite loop ──
const infiniteList: Testimonial[] = [
  ...testimonials,
  ...testimonials,
  ...testimonials,
];

// ── Star Rating ──
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star: number) => (
      <Star
        key={star}
        size={14}
        className={
          star <= rating
            ? "text-[#FFB700] fill-[#FFB700]"
            : "text-gray-200 fill-gray-100"
        }
      />
    ))}
  </div>
);

// ── Avatar Fallback (initials) ──
const Avatar = ({ name, src }: { name: string; src: string }) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  if (imgError) {
    return (
      <div className="w-12 h-12 rounded-full bg-[#FFB700] flex items-center justify-center flex-shrink-0">
        <span className="text-[#1C1C1E] font-black text-sm">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-[#FFB700]/30"
    />
  );
};

// ── Testimonial Card ──
const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <div className="flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#FFB700]/40 transition-all duration-200 h-full">

    {/* Quote Icon */}
    <div className="flex items-center justify-between">
      <Quote size={28} className="text-[#FFB700] fill-[#FFB700]/20" />
      <StarRating rating={item.rating} />
    </div>

    {/* Review Text */}
    <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-4">
      "{item.review}"
    </p>

    {/* Divider */}
    <div className="h-px bg-gray-100" />

    {/* Author */}
    <div className="flex items-center gap-3">
      <Avatar name={item.name} src={item.avatar} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[#1C1C1E] font-black text-sm truncate">{item.name}</p>
        <p className="text-gray-400 text-xs truncate">{item.role}</p>
      </div>
      <span className="ml-auto text-gray-300 text-xs flex-shrink-0">{item.date}</span>
    </div>
  </div>
);

// ── Responsive visible count hook ──
const useVisibleCount = (): number => {
  const [count, setCount] = useState<number>(4);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCount(4);
      else if (window.innerWidth >= 640) setCount(3);
      else setCount(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
};

// ── Main Component ──
const Testimonials = () => {
  const visibleCount                  = useVisibleCount();
  const trackRef                      = useRef<HTMLDivElement>(null);
  const animationRef                  = useRef<number>(0);
  const posRef                        = useRef<number>(0);
  const [isPaused, setIsPaused]       = useState<boolean>(false);
  const isPausedRef                   = useRef<boolean>(false);

  // Card width = (container / visibleCount)
  // We use CSS var set dynamically
  const CARD_GAP    = 16; // gap-4 = 16px
  const CARD_WIDTH  = useRef<number>(0);
  const TOTAL_WIDTH = useRef<number>(0); // width of one set (6 cards)

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const container = track.parentElement;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    CARD_WIDTH.current   = (containerWidth - CARD_GAP * (visibleCount - 1)) / visibleCount;
    TOTAL_WIDTH.current  = (CARD_WIDTH.current + CARD_GAP) * testimonials.length;

    // Reset position
    posRef.current = 0;

    const animate = () => {
      if (!isPausedRef.current) {
        posRef.current += 0.5; // speed — increase for faster

        // Reset when one full set scrolled
        if (posRef.current >= TOTAL_WIDTH.current) {
          posRef.current = 0;
        }

        if (track) {
          track.style.transform = `translateX(-${posRef.current}px)`;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [visibleCount]);

  // Card width class mapping
  const cardWidthClass =
    visibleCount === 4 ? "w-[calc((100%-48px)/4)]" :
    visibleCount === 3 ? "w-[calc((100%-32px)/3)]" :
    "w-[calc((100%-16px)/2)]";

  return (
    <section className="bg-[#F5F5F5] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* ── Section Header ── */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-[#1C1C1E] text-2xl md:text-3xl font-black uppercase tracking-tight">
            What Our <span className="text-[#FFB700]">Customers Say</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-md">
            Trusted by thousands of professionals and DIY enthusiasts across the UK.
          </p>
          {/* Yellow underline */}
          <div className="w-16 h-1 bg-[#FFB700] rounded-full mt-1" />
        </div>

        {/* ── Scrolling Track Wrapper ── */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {infiniteList.map((item: Testimonial, index: number) => (
              <div
                key={`${item.id}-${index}`}
                className={`${cardWidthClass} flex-shrink-0`}
                style={{
                  width: `calc((100vw - 2rem - ${CARD_GAP * (visibleCount - 1)}px) / ${visibleCount})`,
                  maxWidth: "340px",
                }}
              >
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Static Dots — show page position ── */}
        <div className="flex items-center justify-center gap-2">
          {testimonials.map((_: Testimonial, i: number) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < visibleCount
                  ? "w-5 h-2 bg-[#FFB700]"
                  : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
