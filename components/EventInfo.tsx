export default function EventInfo() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A4C6D] mb-4">
            2026 World Championship
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about the tournament
          </p>
        </div>

        {/* Event Details Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#0A4C6D] to-[#00D9FF] px-8 py-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center">
                7th CMAS World Championship
              </h3>
              <p className="text-center text-white/90 mt-2">
                Underwater Hockey Age Group
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#00D9FF]/10 rounded-lg p-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#0A4C6D]"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A4C6D] mb-1">Dates</h4>
                    <p className="text-gray-700">July 16-26, 2026</p>
                    <p className="text-sm text-gray-500 mt-1">10 days of competition</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#00D9FF]/10 rounded-lg p-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#0A4C6D]"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A4C6D] mb-1">Location</h4>
                    <p className="text-gray-700">Gebze / Kocaeli</p>
                    <p className="text-sm text-gray-500 mt-1">Turkey 🇹🇷</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#00D9FF]/10 rounded-lg p-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#0A4C6D]"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A4C6D] mb-1">Category</h4>
                    <p className="text-gray-700">U19 Men</p>
                    <p className="text-sm text-gray-500 mt-1">Under 19 years old</p>
                  </div>
                </div>

                {/* Organization */}
                <div className="flex items-start gap-4">
                  <div className="bg-[#00D9FF]/10 rounded-lg p-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#0A4C6D]"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0A4C6D] mb-1">Organization</h4>
                    <p className="text-gray-700">CMAS</p>
                    <p className="text-sm text-gray-500 mt-1">
                      World Underwater Federation
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-10 text-center">
                <a
                  href="https://www.cmas.org/underwater-hockey-events/2026-cmas-world-championship-underwater-hockey-age-group.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A4C6D] to-[#00D9FF] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  View Official Event Page
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
