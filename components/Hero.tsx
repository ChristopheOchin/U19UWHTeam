import CountdownTimer from './CountdownTimer';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Using a gradient overlay for now, can replace with actual image */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A4C6D] via-[#0A4C6D] to-[#1E3A5F] z-0">
        {/* Animated water effect overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.3),transparent_50%)] animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* USA Flag Colors Accent */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-16 h-1 bg-[#DC143C]"></div>
          <div className="w-16 h-1 bg-white"></div>
          <div className="w-16 h-1 bg-[#DC143C]"></div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
          U19 USA Underwater Hockey
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-3xl text-cyan-300 font-medium mb-12 drop-shadow-md">
          Road to Turkey 2026
        </p>

        {/* Countdown Title */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl text-white/90 font-semibold mb-2">
            Countdown to Worlds
          </h2>
          <p className="text-base md:text-lg text-white/70">
            7th CMAS World Championship • Gebze, Turkey
          </p>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Scroll Indicator */}
        <div className="mt-16 animate-bounce">
          <svg
            className="w-6 h-6 mx-auto text-white/60"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="#F3F4F6"
          />
        </svg>
      </div>
    </section>
  );
}
