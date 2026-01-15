export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#0A4C6D] to-[#1E3A5F] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* About Column */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#00D9FF]">
                U19 USA UWH
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Representing the United States at the 2026 CMAS World Championship
                Underwater Hockey Age Group in Turkey.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#00D9FF]">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.strava.com/clubs/1853738/members"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#00D9FF] transition-colors duration-200 text-sm"
                  >
                    Strava Club
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.cmas.org/underwater-hockey-events/2026-cmas-world-championship-underwater-hockey-age-group.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#00D9FF] transition-colors duration-200 text-sm"
                  >
                    Official Event Page
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.cmas.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#00D9FF] transition-colors duration-200 text-sm"
                  >
                    CMAS
                  </a>
                </li>
              </ul>
            </div>

            {/* Event Info Column */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#00D9FF]">
                Event Info
              </h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>📅 July 16-26, 2026</li>
                <li>📍 Gebze / Kocaeli, Turkey</li>
                <li>🏆 U19 Men's Category</li>
                <li>🌊 Underwater Hockey</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/20 my-8"></div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-white/60 text-center md:text-left">
              © {currentYear} U19 USA Underwater Hockey Team. All rights reserved.
            </div>

            {/* USA Flag */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span>
              <span className="text-sm text-white/80 font-medium">
                Team USA
              </span>
            </div>

            {/* Social Links Placeholder */}
            <div className="flex gap-4">
              {/* Placeholder for future social media links */}
              <div className="text-xs text-white/40 italic">
                Social links coming soon
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/40">
              Built with Next.js • Deployed on Vercel
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
