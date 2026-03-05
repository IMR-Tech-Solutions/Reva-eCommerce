

const Abouthubsection = () => {
  const images = [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80",
  ];

  return (
    <section className="w-full bg-gray-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
        
        {/* Left: 2x2 Clean Image Grid */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {images.map((src, i) => (
              <div 
                key={i} 
                className="overflow-hidden rounded-lg shadow-sm bg-white"
              >
                {/* h-40 for mobile, h-64 for desktop keeps the 'lines' even */}
                <img
                  src={src}
                  alt={`Tool store ${i + 1}`}
                  className="w-full h-40 sm:h-52 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            A Hub of Inspiration For Tool-Lovers
          </h2>
          
          <div className="space-y-5 text-gray-600">
            <p className="text-gray-900 font-bold text-lg">
              Understanding who buys our tools and what it is you're looking for from
              a tool supplier, is what keeps us on our toes!
            </p>
            
            <p className="leading-relaxed">
              10 years ago, from a small home county village, came a big idea to bring together
              an extensive range of power and hand tools, accessories, hardware, workwear,
              consumables, security and more, to a new online platform.
            </p>
            
            <p className="leading-relaxed">
              Unlocking in excess of <strong className="text-gray-900 font-bold underline decoration-[#FFB700] decoration-2 underline-offset-4">30,000</strong> products
              to a nation under one virtual roof, Equipo is now the 'one-stop-shop' for many
              Trade Professionals and DIY enthusiasts.
            </p>
            
            <p className="leading-relaxed">
              We have built excellent relationships with top manufacturers such as DeWalt,
              Makita, Stanley etc. to give you the best deals, the biggest ranges and all the
              information you need.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Abouthubsection;