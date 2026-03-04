import React from 'react';

const Aboutwhatmakesus = () => {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
        
        {/* Left: Text Content */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              What Makes Us, Us?
            </h2>
            <p className="text-[#E6A600] font-semibold mb-6 tracking-wide">
              Behind the scenes, Equipo is a family of tea-drinkers and tool-fanatics.
            </p>
          </div>
          
          <div className="space-y-4 text-gray-500 text-base md:text-lg leading-relaxed">
            <p>
              If a new machine hits the market, we know about it and we make it our top priority
              to bring it here at our lowest price. Not only are we scouting for the next best
              thing, we pride ourselves on offering such an extensive range of tools and
              accessories online.
            </p>
            <p>
              There are in excess of{" "}
              <strong className="text-gray-900 font-bold border-b-2 border-[#FFB700]/30">
                25,000
              </strong>{" "}
              products on our website to date and we just keep growing!
            </p>
            <p>
              You'll find everything and anything from Power Drills to Cleaning Consumables,
              but every order is important to us, and no matter how big or small, we offer a
              service that is second to none.
            </p>
          </div>
        </div>

        {/* Right: Video thumbnail */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.01] cursor-pointer">
            {/* Aspect Ratio Box ensures the image looks good on all screens */}
            <div className="aspect-video lg:aspect-square xl:aspect-video overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80"
                alt="Worker in tool store"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Overlay and Play Button */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="relative">
                {/* Pulsing effect */}
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-[#FFB700] hover:bg-[#E6A600] rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                  <svg 
                    className="w-8 h-8 text-white ml-1.5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Aboutwhatmakesus;