import React from 'react';

const brands = [
  { name: "3M", img: "https://placehold.co/200x100?text=3M" },
  { name: "Annovi Reverberi", img: "https://placehold.co/200x100?text=Annovi" },
  { name: "Bostitch", img: "https://placehold.co/200x100?text=Bostitch" },
  { name: "Comet Pump", img: "https://placehold.co/200x100?text=Comet" },
  { name: "Crescent", img: "https://placehold.co/200x100?text=Crescent" },
  { name: "Dewalt", img: "https://placehold.co/200x100?text=Dewalt" },
  { name: "Dremel", img: "https://placehold.co/200x100?text=Dremel" },
  { name: "Duo-Fast", img: "https://placehold.co/200x100?text=DuoFast" },
  { name: "Edge", img: "https://placehold.co/200x100?text=Edge" },
  { name: "ERB", img: "https://placehold.co/200x100?text=ERB" },
  { name: "Falltech", img: "https://placehold.co/200x100?text=Falltech" },
  { name: "Fein", img: "https://placehold.co/200x100?text=Fein" },
  { name: "GearWrench", img: "https://placehold.co/200x100?text=GearWrench" },
  { name: "General Pump", img: "https://placehold.co/200x100?text=General" },
  { name: "Hitachi", img: "https://placehold.co/200x100?text=Hitachi" },
  { name: "Homelite", img: "https://placehold.co/200x100?text=Homelite" },
  { name: "Irwin", img: "https://placehold.co/200x100?text=Irwin" },
  { name: "Karcher", img: "https://placehold.co/200x100?text=Karcher" },
  { name: "Kinco", img: "https://placehold.co/200x100?text=Kinco" },
  { name: "Klein Tools", img: "https://placehold.co/200x100?text=Klein" },
  { name: "Lift Safety", img: "https://placehold.co/200x100?text=Lift" },
  { name: "Makita", img: "https://placehold.co/200x100?text=Makita" },
  { name: "Malco", img: "https://placehold.co/200x100?text=Malco" },
  { name: "MBW", img: "https://placehold.co/200x100?text=MBW" },
  { name: "Milwaukee", img: "https://placehold.co/200x100?text=Milwaukee" },
  { name: "MTM Hydro", img: "https://placehold.co/200x100?text=MTM" },
  { name: "Stanley", img: "https://placehold.co/200x100?text=Stanley" },
  { name: "Senco", img: "https://placehold.co/200x100?text=Senco" },
];

const AboutTopBrands = () => {
  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Top Brands</h2>
            <div className="h-1 w-16 bg-[#FFB700] mt-3"></div>
          </div>
          <p className="text-gray-500 max-w-md text-sm md:text-right">
            Partnering with the industry's most trusted manufacturers to bring you professional-grade quality.
          </p>
        </div>

        {/* Responsive Grid Breakdown:
            - 2 columns on mobile (to keep text readable)
            - 3 columns on small tablets
            - 4 columns on tablets
            - 6 columns on desktop
        */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 border-t border-l border-gray-100">
          {brands.map((brand, i) => (
            <div
              key={i}
              className="group bg-white border-r border-b border-gray-100 flex flex-col items-center justify-center p-6 transition-all duration-300 hover:shadow-xl hover:z-10 relative overflow-hidden"
            >
              {/* Logo Container */}
              <div className="w-full h-16 relative flex items-center justify-center mb-4">
                <img 
                  src={brand.img} 
                  alt={`${brand.name} logo`}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100"
                />
              </div>
              
              {/* Brand Label */}
              <span className="text-gray-400 group-hover:text-gray-900 text-xs font-bold uppercase tracking-widest text-center transition-colors duration-300">
                {brand.name}
              </span>

              {/* Subtle hover accent */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFB700] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutTopBrands;