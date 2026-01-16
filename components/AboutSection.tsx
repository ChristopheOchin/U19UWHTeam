import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A4C6D] mb-4">
              About Our Team
            </h2>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            {/* Team Description */}
            <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
              The U19 USA Men's Underwater Hockey team is training hard for the
              2026 CMAS World Championship in Turkey. Follow our journey as we
              prepare to compete against the world's best young athletes.
            </p>

            {/* Logos Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                {/* CMAS Logo */}
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    <Image
                      src="/images/cmas-logo.png"
                      alt="CMAS Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">CMAS</p>
                </div>

                {/* Turkish Federation Logo */}
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    <Image
                      src="/images/tssf-logo.png"
                      alt="Turkish Underwater Sports Federation Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">Turkish Federation</p>
                </div>
              </div>
            </div>
          </div>

          {/* USA Hockey Info Card */}
          <div className="mt-8 bg-gradient-to-r from-[#DC143C]/10 to-[#0A4C6D]/10 rounded-xl p-6 border-l-4 border-[#DC143C]">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🇺🇸</div>
              <div>
                <h4 className="font-semibold text-[#0A4C6D] mb-2">
                  Representing Team USA
                </h4>
                <p className="text-gray-600">
                  Proudly competing in the U19 Men's category at the World Championship
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
