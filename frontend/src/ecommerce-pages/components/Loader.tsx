// src/components/Loader.tsx

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">

        {/* ── Card wrapper ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center gap-6 relative overflow-hidden">

          {/* Dot pattern bg */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #1C1C1E 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FFB700]" />

          {/* ── Spinner ── */}
          <div className="relative w-16 h-16 z-10">

            {/* Outer track */}
            <div className="absolute inset-0 rounded-full border-4 border-[#FFB700]/10" />

            {/* Spinning arc */}
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFB700] animate-spin"
              style={{ animationDuration: "1.2s" }}
            />

            {/* Secondary counter arc */}
            <div
              className="absolute inset-1 rounded-full border-4 border-transparent border-b-[#1C1C1E]/20 animate-spin"
              style={{ animationDuration: "2.5s", animationDirection: "reverse" }}
            />

            {/* Center icon box */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#FFB700]/10 border border-[#FFB700]/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-[#FFB700] rounded-sm animate-pulse" />
              </div>
            </div>
          </div>

          {/* ── Text block ── */}
          <div className="flex flex-col items-center gap-2 z-10">

            {/* Yellow flanked header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-0.5 bg-[#FFB700] rounded-full" />
              <span className="text-[#1C1C1E] font-black text-xs uppercase tracking-[0.2em]">
                Loading
              </span>
              <div className="w-4 h-0.5 bg-[#FFB700] rounded-full" />
            </div>

            <p className="text-gray-400 text-[11px] font-semibold">
              Please wait a moment...
            </p>

            {/* Animated progress bar */}
            <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#FFB700] rounded-full loadbar-anim" />
            </div>
          </div>

          {/* ── Bouncing dots ── */}
          <div className="flex items-center gap-2 z-10">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-[#FFB700] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.25}s`, animationDuration: "1s" }}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes loadbar {
          0%   { width: 0%;   margin-left: 0%;   }
          50%  { width: 60%;  margin-left: 20%;  }
          100% { width: 0%;   margin-left: 100%; }
        }
        .loadbar-anim {
          animation: loadbar 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
