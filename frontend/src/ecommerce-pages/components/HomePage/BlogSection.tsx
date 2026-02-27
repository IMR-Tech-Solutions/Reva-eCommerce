import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// ── Types ──
type BlogPost = {
  id: number;
  day: string;
  month: string;
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

// ── Data — 5 posts with Unsplash images ──
const blogPosts: BlogPost[] = [
  {
    id: 1,
    day: "20",
    month: "JAN",
    category: "Information",
    categoryColor: "text-[#FFB700]",
    title: "Check our new collection of tools accessories, hot sale!",
    excerpt:
      "Objectively innovate empowered manufactured products whereas parallel platforms. Holisticly syndicate...",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
    href: "/blog/tools-accessories",
  },
  {
    id: 2,
    day: "20",
    month: "FEB",
    category: "Insights",
    categoryColor: "text-[#FFB700]",
    title: "Top 10 must have tools in your tool pack, check the new..",
    excerpt:
      "Completely synergize resource taxing relationships via premier niche markets. Professionally...",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
    href: "/blog/top-10-tools",
  },
  {
    id: 3,
    day: "20",
    month: "FEB",
    category: "Events",
    categoryColor: "text-[#FFB700]",
    title: "How to get maximum from pressure washers, tips and..",
    excerpt:
      "Efficiently unleash cross-media information without cross-media value. Quickly maximize timely...",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
    href: "/blog/pressure-washers",
  },
 {
  id: 4,
  day: "12",
  month: "MAR",
  category: "Safety",
  categoryColor: "text-[#FFB700]",
  title: "Essential safety equipment every professional needs on site",
  excerpt: "Collaboratively administrate empowered markets via plug-and-play networks. Dynamically...",
  image:  "/ecommerce-images/product2.jpg"
, // Hard hat + goggles on construction site
  href: "/blog/safety-equipment",
},

  {
    id: 5,
    day: "12",
    month: "MAR",
    category: "Safety",
    categoryColor: "text-[#FFB700]",
    title: "Essential safety equipment every professional needs on site",
    excerpt:
      "Collaboratively administrate empowered markets via plug-and-play networks. Dynamically...",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80",
    href: "/blog/safety-equipment",
  },
];


// Triplicate for infinite loop
const infiniteList: BlogPost[] = [
  ...blogPosts,
  ...blogPosts,
  ...blogPosts,
];

// ── Responsive Hook ──
const useVisibleCount = (): number => {
  const [count, setCount] = useState<number>(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCount(3);
      else if (window.innerWidth >= 640) setCount(2);
      else setCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
};

// ── Blog Card ──
const BlogCard = ({ post }: { post: BlogPost }) => (
  <a
    href={post.href}
    className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#FFB700]/30 transition-all duration-300 h-full"
  >
    {/* Image */}
    <div className="relative w-full h-56 overflow-hidden flex-shrink-0">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Date Badge */}
      <div className="absolute top-4 left-4 bg-[#FFB700] text-[#1C1C1E] rounded-lg flex flex-col items-center justify-center w-12 h-14 shadow-md">
        <span className="font-black text-xl leading-tight">{post.day}</span>
        <span className="font-black text-[10px] uppercase tracking-wide leading-tight">
          {post.month}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col gap-3 p-5 flex-1">

      {/* Category */}
      <span className={`${post.categoryColor} text-xs font-black uppercase tracking-widest`}>
        {post.category}
      </span>

      {/* Title */}
      <h3 className="text-[#1C1C1E] font-black text-base leading-snug line-clamp-2 group-hover:text-[#FFB700] transition-colors duration-200">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
        {post.excerpt}
      </p>

      {/* Read More */}
      <div className={`flex items-center gap-1 ${post.categoryColor} text-sm font-black mt-auto group-hover:gap-2 transition-all duration-200`}>
        Read more
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </div>
  </a>
);

// ── Main Component ──
const BlogSection = () => {
  const visibleCount                  = useVisibleCount();
  const trackRef                      = useRef<HTMLDivElement>(null);
  const animationRef                  = useRef<number>(0);
  const posRef                        = useRef<number>(0);
  const isPausedRef                   = useRef<boolean>(false);
  const [isPaused, setIsPaused]       = useState<boolean>(false);
  const cardWidthRef                  = useRef<number>(0);
  const totalWidthRef                 = useRef<number>(0);
  const GAP                           = 24; // gap-6

  // Sync pause ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const container = track.parentElement;
    if (!container) return;

    const containerW       = container.offsetWidth;
    cardWidthRef.current   = (containerW - GAP * (visibleCount - 1)) / visibleCount;
    totalWidthRef.current  = (cardWidthRef.current + GAP) * blogPosts.length;
    posRef.current         = 0;

    const animate = () => {
      if (!isPausedRef.current) {
        posRef.current += 0.4;
        if (posRef.current >= totalWidthRef.current) {
          posRef.current = 0;
        }
        if (track) track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [visibleCount]);

  // Manual arrow navigation
  const handlePrev = () => {
    posRef.current = Math.max(0, posRef.current - (cardWidthRef.current + GAP));
  };

  const handleNext = () => {
    posRef.current = posRef.current + (cardWidthRef.current + GAP);
    if (posRef.current >= totalWidthRef.current) posRef.current = 0;
  };

  return (
    <section className="bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-[#1C1C1E] font-black text-2xl md:text-3xl">
            Stay Informed{" "}
            <span className="text-[#FFB700]">@Reva Store</span>
          </h2>
          <p className="text-gray-500 text-sm">
            Latest offers, promos, product releases and industry news
          </p>
          <div className="w-14 h-1 bg-[#FFB700] rounded-full mt-1" />
        </div>

        {/* ── Carousel Wrapper ── */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 hover:bg-[#FFB700] hover:border-[#FFB700] hover:text-[#1C1C1E] text-gray-600 rounded flex items-center justify-center shadow-md transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={17} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 hover:bg-[#FFB700] hover:border-[#FFB700] hover:text-[#1C1C1E] text-gray-600 rounded flex items-center justify-center shadow-md transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight size={17} />
          </button>

          {/* Track Overflow Container */}
          <div
            className="overflow-hidden mx-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={trackRef}
              className="flex gap-6 will-change-transform"
              style={{ width: "max-content" }}
            >
              {infiniteList.map((post: BlogPost, index: number) => (
                <div
                  key={`${post.id}-${index}`}
                  style={{
                    width: `calc((100vw - 2rem - ${GAP * (visibleCount - 1)}px - 48px) / ${visibleCount})`,
                    maxWidth: "420px",
                    minWidth: "260px",
                    flexShrink: 0,
                  }}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dot Indicators ── */}
        <div className="flex items-center justify-center gap-2">
          {blogPosts.map((_: BlogPost, i: number) => (
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

export default BlogSection;
