import React from 'react';

const AboutHero = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24 max-w-7xl mx-auto">
      {/* Small eyebrow title */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 md:mb-12">
        About us
      </h1>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
        {/* Left: Image Container */}
        <div className="w-full lg:w-1/2">
          <div className="relative group">
            {/* Optional: Subtle decorative border for a premium feel */}
            <div className="absolute -inset-2 bg-gray-100 rounded-lg -z-10 transition-all group-hover:-inset-3" />
            
            <img
              src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80"
              alt="Hardware store aisle"
              className="w-full h-[300px] sm:h-[400px] lg:h-[480px] object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="w-full lg:w-1/2 relative">
          {/* Dot pattern background - hidden on very small screens to reduce visual noise */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none hidden sm:block"
            style={{
              backgroundImage: "radial-gradient(circle, #9CA3AF 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative z-10 text-center lg:text-left">
            <p className="text-[#E6A600] font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
              Our Company
            </p>
            
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-[1.2] mb-6">
              We're Equipo, a Broad Equipment Company With a <span className="text-[#FFB700]">Proud History.</span>
            </h2>
            
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Revolutionizing the tools accessories industry through a focus on
              innovation, inspiration and unmatched service. Equipo provides an
              immersive and engaging experience for tools enthusiasts through
              expert advice and comprehensive information on every product we
              sell.
            </p>

            {/* Optional: Call to action often found in Hero sections */}
            <div className="mt-8">
               <button className="bg-gray-900 text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition-colors">
                 Learn Our Story
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;