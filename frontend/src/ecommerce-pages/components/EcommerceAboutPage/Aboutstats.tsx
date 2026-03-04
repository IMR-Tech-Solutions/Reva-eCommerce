import React from 'react';

const Aboutstats = () => {
  const stats = [
    {
      value: "200+",
      label: "New employees",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 opacity-10 absolute -bottom-2 left-1/2 -translate-x-1/2">
          <circle cx="32" cy="24" r="10" stroke="#3B82F6" strokeWidth="2" />
          <path d="M12 56c0-11.046 8.954-20 20-20s20 8.954 20 20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "875k",
      label: "Items sold",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 opacity-10 absolute -bottom-2 left-1/2 -translate-x-1/2">
          <path d="M8 56V28L32 8l24 20v28" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
          <rect x="22" y="38" width="20" height="18" stroke="#3B82F6" strokeWidth="2" />
        </svg>
      ),
    },
    {
      value: "18%",
      label: "Market increase",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 opacity-10 absolute -bottom-2 left-1/2 -translate-x-1/2">
          <circle cx="32" cy="32" r="26" stroke="#3B82F6" strokeWidth="2" />
          <path d="M18 42l8-12 7 7 11-16" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: "512",
      label: "Brands",
      icon: (
        <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 opacity-10 absolute -bottom-2 left-1/2 -translate-x-1/2">
          <path d="M8 56V22L32 6l24 16v34" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
          <rect x="22" y="34" width="20" height="22" stroke="#3B82F6" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-blue-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-gray-200">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`
                relative flex flex-col items-center py-12 px-4 overflow-hidden transition-colors duration-300 hover:bg-white/50
                /* Responsive Borders */
                border-b sm:border-b-0
                ${i % 2 === 0 ? 'sm:border-r' : 'sm:border-r-0'} 
                lg:border-r lg:last:border-r-0
                border-blue-100
              `}
            >
              {stat.icon}
              
              <div className="relative z-10 text-center">
                <span className="block text-4xl md:text-5xl font-black text-blue-500 tracking-tight">
                  {stat.value}
                </span>
                <span className="block text-gray-600 font-bold mt-2 uppercase text-xs tracking-widest">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Aboutstats;