# U19 USA Underwater Hockey Team Website

Official website for the U19 USA Men's Underwater Hockey team preparing for the 2026 CMAS World Championship in Turkey.

## Features

- **Live Countdown**: Real-time countdown to the World Championship (July 16-26, 2026)
- **Strava Integration**: Embedded club activity feed and statistics
- **Event Information**: Complete details about the 2026 CMAS World Championship
- **Mobile-Responsive**: Optimized for all devices with mobile-first design
- **Modern Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel (recommended)
- **Version Control**: Git/GitHub

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd U19UWHTeam
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   └── favicon.ico        # Site favicon
├── components/            # React components
│   ├── CountdownTimer.tsx # Live countdown to Worlds
│   ├── Hero.tsx           # Hero section with countdown
│   ├── AboutSection.tsx   # Team information
│   ├── StravaSection.tsx  # Strava club widgets
│   ├── EventInfo.tsx      # Championship details
│   └── Footer.tsx         # Site footer
├── public/                # Static assets
├── claude.md              # AI assistant context (important!)
└── README.md              # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Updating Content

### For Non-Technical Team Members

#### Simple Text Changes
1. Go to the GitHub repository
2. Navigate to the file you want to edit
3. Click the pencil icon to edit
4. Make your changes
5. Commit with a clear message
6. Create a pull request
7. Wait for review and merge

#### Adding Images
1. Upload images to the `public/images/` folder
2. Reference them in components as `/images/your-image.jpg`
3. Create a pull request

### For Technical Team Members

1. Create a new branch:
```bash
git checkout -b update/your-feature-name
```

2. Make your changes

3. Test locally:
```bash
npm run dev
```

4. Commit and push:
```bash
git add .
git commit -m "Description of changes"
git push origin update/your-feature-name
```

5. Create a pull request on GitHub

6. After review and merge, Vercel will auto-deploy

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js and configure everything
6. **BEFORE deploying**, set up databases and environment variables (see below)
7. Click "Deploy"

Your site will be live at `https://your-project-name.vercel.app`

### Database & Cache Setup (REQUIRED)

The team leaderboard feature requires Vercel Postgres and Vercel KV. Follow the detailed setup guide:

📖 **See [SETUP_DATABASE.md](./SETUP_DATABASE.md) for complete instructions**

Quick summary:
1. Create Vercel Postgres database in your project
2. Run the migration from `lib/db/migrations/001_initial.sql`
3. Create Vercel KV (Redis) cache
4. Generate and add authentication secrets:
   ```bash
   node scripts/generate-secrets.js "your-team-password"
   ```
5. Add environment variables to Vercel (see `.env.example`)

### Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Team Leaderboard (Password Protected)

The `/team` area is password-protected and shows:
- Weekly training leaderboard (coming in Phase 3)
- Swimming activities highlighted with 1.5x weight
- Real-time activity feed from Strava
- HR intensity dashboard (informational only)

**To access**: Visit `/team/login` and enter the team password

## Important Files

### claude.md
This file contains comprehensive context for AI assistants working on the project. Read this file before making changes to understand the project architecture, decisions, and guidelines.

### Key Components

- **CountdownTimer.tsx**: Calculates time to July 16, 2026 (Turkey time GMT+3). Updates every second.
- **StravaSection.tsx**: Contains iframe embeds for club activity. Do not modify iframe URLs.
- **Hero.tsx**: Main hero section with countdown. Uses water-themed gradient background.

## Event Details

- **Event**: 7th CMAS World Championship Underwater Hockey Age Group
- **Dates**: July 16-26, 2026
- **Location**: Gebze / Kocaeli, Turkey
- **Category**: U19 Men
- **Strava Club**: https://www.strava.com/clubs/1853738/members

## Design Guidelines

### Color Palette
- Primary Blue: `#0A4C6D` (underwater theme)
- Accent Cyan: `#00D9FF` (energetic)
- USA Red: `#DC143C` (patriotic)
- White: `#FFFFFF`
- Light Gray: `#F3F4F6`

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold weights
- Body: Regular weights

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Contributing

1. Read `claude.md` for full project context
2. Follow the existing code style
3. Test on mobile devices
4. Keep the water theme consistent
5. Don't break the Strava embeds
6. Optimize images before adding

## Performance

Target metrics:
- Load time: < 2 seconds
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Mobile-first responsive design

## Support

For questions or issues:
- Check `claude.md` for detailed context
- Review existing code for patterns
- Create an issue on GitHub
- Contact technical team member

## License

© 2026 U19 USA Underwater Hockey Team. All rights reserved.

---

**Built with** ❤️ **by the U19 USA UWH Team**

🇺🇸 Team USA • 🌊 Underwater Hockey • 🏆 Road to Turkey 2026
