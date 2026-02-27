import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

// ── Types ──
type Slide = {
  id: number;
  image: string;
  smallTitle: string;
  title: string;
  highlight: string;
  cta: string;
};

const slides: Slide[] = [
  {
    id: 1,
    image: "/ecommerce-images/slide3.jpg",
    smallTitle: "HUGE SAVINGS UP TO 70%",
    title: "SUMMER SALE",
    highlight: "GET THE MOST ESSENTIALS",
    cta: "Shop Now",
  },
  {
    id: 2,
    image: "/ecommerce-images/slide2.jpg",
    smallTitle: "SPREAD THE COST UP TO 3 YEARS",
    title: "BUY IT NOW",
    highlight: "PAY ON YOUR TERMS",
    cta: "Explore Deals",
  },
  {
    id: 3,
    image: "/ecommerce-images/slide1.jpg",
    smallTitle: "IT'S ALL THE POWER YOU NEED",
    title: "GET 30% OFF",
    highlight: "FOR POWER TOOLS",
    cta: "View Offers",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);

 useEffect(() => {
  const interval = setInterval(() => {
    handleNext();
  }, 3000);

  return () => clearInterval(interval);
}, []); // <- remove `current` from deps so interval is stable

const handleNext = () => {
  if (animating) return;
  setAnimating(true);
  setCurrent(prev => (prev + 1) % slides.length); // <- this already loops
  setTimeout(() => setAnimating(false), 700);
};


  

  const goToSlide = (index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 700);
  };

  return (
    <div className="relative w-full h-[520px] md:h-[580px] overflow-hidden bg-[#1C1C1E]">

      {/* ── SLIDES ── */}
      {slides.map((slide: Slide, index: number) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out
            ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {/* Background Image */}
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Gradient Overlay */}
            <div className="w-full h-full bg-gradient-to-r from-[#1C1C1E]/90 via-[#1C1C1E]/60 to-transparent">
              <div className="max-w-7xl mx-auto px-6 h-full flex items-center">

                {/* Text Content */}
                <div
                  className={`text-white max-w-3xl transition-all duration-700 delay-200
                    ${index === current
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                    }`}
                >
                  {/* Small Tag */}
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="w-8 h-0.5 bg-[#FFB700]" />
                    <p className="text-[#FFB700] text-xs md:text-xl font-bold uppercase tracking-widest">
                      {slide.smallTitle}
                    </p>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-4xl md:text-8xl font-black leading-tight mb-3 text-white">
                    {slide.title}
                  </h1>

                  {/* Highlight */}
                  <h2 className="text-2xl md:text-5xl font-extrabold text-[#FFB700] mb-8 leading-tight">
                    {slide.highlight}
                  </h2>

                  {/* CTA Button */}
                  <button className="group inline-flex items-center gap-2 bg-white hover:bg-[#FFC933] text-[#1C1C1E] font-black text-sm md:text-base px-7 py-3.5 rounded transition-all duration-200 hover:gap-3 hover:shadow-lg hover:shadow-[#FFB700]/30">
                    {slide.cta}
                    <ArrowRight
                      size={17}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}

   

      {/* ── BOTTOM CONTROLS ── */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Progress Bars (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {slides.map((_: Slide, index: number) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                style={{ width: index === current ? "48px" : "24px" }}
              >
                <span className="absolute inset-0 bg-white/30 rounded-full" />
                {index === current && (
                  <span
                    className="absolute inset-0 bg-[#FFB700] rounded-full origin-left"
                    style={{ animation: "progress 5s linear forwards" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Counter + Dots */}
          <div className="flex items-center gap-4 ml-auto">

            {/* 01 / 03 counter */}
            <div className="flex items-center gap-1 text-white/60 text-sm font-bold">
              <span className="text-[#FFB700] text-base font-black">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span>/</span>
              <span>{String(slides.length).padStart(2, "0")}</span>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_: Slide, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full cursor-pointer transition-all duration-300
                    ${index === current
                      ? "w-5 h-2 bg-[#FFB700]"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS ANIMATION ── */}
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

    </div>
  );
};

export default HeroSection;
