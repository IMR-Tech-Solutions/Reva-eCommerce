import React from 'react';

const leaders = [
  {
    name: "Greg Nelson",
    title: "President, E-commerce",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
  {
    name: "Tanya Harris",
    title: "VP of Information Technology",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Sidney Millspaugh",
    title: "VP of Technology",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Dave Brady",
    title: "VP of Sales and Service",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  },
  {
    name: "Tim Schaeffer",
    title: "VP of Marketing",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
  },
  {
    name: "Mark Harrison",
    title: "VP of Finance",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
  },
  {
    name: "Lila Brown",
    title: "VP of Merchandising",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  },
  {
    name: "Amanda Smith",
    title: "Director of Human Resources",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  },
];

const Aboutleadership = () => {
  return (
    <section className="w-full py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Our Leadership
          </h2>
          <div className="h-1 w-20 bg-[#FFB700] mt-4"></div>
        </div>

        {/* Grid Adjustments: 
            1 col on tiny phones, 2 on mobile, 3 on tablet, 4 on desktop 
        */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {leaders.map((person, i) => (
            <div
              key={i}
              className="group flex flex-col h-full rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative overflow-hidden aspect-[4/5]">
                <img
                  src={person.img}
                  alt={person.name}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out scale-100 group-hover:scale-105"
                />
              </div>
              
              <div className="p-5 flex-grow flex flex-col justify-center">
                <p className="text-[#E6A600] font-bold text-lg leading-tight">
                  {person.name}
                </p>
                <p className="text-gray-500 text-sm mt-2 font-medium">
                  {person.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Aboutleadership;