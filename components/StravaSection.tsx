export default function StravaSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A4C6D] mb-4">
            Team Training Activity
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow our training progress as we prepare for the World Championship
          </p>
        </div>

        {/* Strava Widgets Container */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start max-w-6xl mx-auto">
          {/* Activity Widget */}
          <div className="flex-1 w-full lg:w-auto flex justify-center">
            <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#0A4C6D] text-white px-4 py-3">
                <h3 className="font-semibold text-lg">Recent Activities</h3>
              </div>
              <div className="p-2 flex justify-center">
                <iframe
                  allowTransparency={true}
                  frameBorder="0"
                  height="454"
                  scrolling="no"
                  src="https://www.strava.com/clubs/1853738/latest-rides/73e451e04f8d8c5053fd216fd00af9cee3bb92a3?show_rides=true"
                  width="300"
                  title="Strava Club Activity Feed"
                  className="mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Summary Widget */}
          <div className="flex-1 w-full lg:w-auto flex justify-center">
            <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-fit">
              <div className="bg-[#00D9FF] text-[#0A4C6D] px-4 py-3">
                <h3 className="font-semibold text-lg">Team Stats</h3>
              </div>
              <div className="p-2 flex justify-center">
                <iframe
                  allowTransparency={true}
                  frameBorder="0"
                  height="160"
                  scrolling="no"
                  src="https://www.strava.com/clubs/1853738/latest-rides/73e451e04f8d8c5053fd216fd00af9cee3bb92a3?show_rides=false"
                  width="300"
                  title="Strava Club Summary Stats"
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Link to Strava Club */}
        <div className="text-center mt-8">
          <a
            href="https://www.strava.com/clubs/1853738/members"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0A4C6D] hover:text-[#00D9FF] font-medium transition-colors duration-200"
          >
            View Full Club on Strava
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
    </section>
  );
}
