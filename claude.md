# U19 USA Underwater Hockey Team Website

## Project Overview
This is the official website for the U19 USA Men's Underwater Hockey team as they prepare for and compete in the 2026 CMAS World Championship in Turkey.

**Target Audience**: Team members, families, supporters, and the broader underwater hockey community

**Primary Goals**:
1. Build excitement with a live countdown to the World Championship
2. Showcase team training activity via Strava integration
3. Provide event information and context
4. Create a professional web presence for the team

## Key Context

### Event Details
- **Event**: 7th CMAS World Championship Underwater Hockey Age Group
- **Dates**: July 16-26, 2026
- **Location**: Gebze / Kocaeli, Turkey (GMT+3 timezone)
- **Category**: U19 Men
- **Official Page**: https://www.cmas.org/underwater-hockey-events/2026-cmas-world-championship-underwater-hockey-age-group.html

### Team Information
- **Team**: U19 USA Men's Underwater Hockey
- **Sport**: Underwater Hockey (also known as Octopush)
- **Federation**: CMAS (Confédération Mondiale des Activités Subaquatiques)
- **Strava Club**: https://www.strava.com/clubs/1853738/members

### Strava Integration
The site features two embedded Strava widgets from the team's club:

**Activity Widget** (Recent activities):
```html
<iframe allowtransparency='true' frameborder='0' height='454' scrolling='no'
  src='https://www.strava.com/clubs/1853738/latest-rides/73e451e04f8d8c5053fd216fd00af9cee3bb92a3?show_rides=true'
  width='300'></iframe>
```

**Summary Widget** (Statistics):
```html
<iframe allowtransparency='true' frameborder='0' height='160' scrolling='no'
  src='https://www.strava.com/clubs/1853738/latest-rides/73e451e04f8d8c5053fd216fd00af9cee3bb92a3?show_rides=false'
  width='300'></iframe>
```

## Architecture Decisions

### Why Next.js 15?
- **Team Collaboration**: Multiple team members need to update content; Next.js component structure makes this easier
- **Performance**: Built-in optimizations (image optimization, code splitting, caching)
- **Modern DX**: Great developer experience for future maintenance
- **Deployment**: Seamless integration with Vercel for free hosting
- **Scalability**: Easy to add features later (roster, photo gallery, news)
- **TypeScript**: Type safety reduces bugs, especially for team collaboration

### Why Tailwind CSS?
- **Rapid Development**: Utility-first approach speeds up styling
- **Consistency**: Design system built-in (colors, spacing, typography)
- **Responsive**: Mobile-first responsive design made easy
- **Performance**: JIT mode generates only needed CSS
- **Maintainability**: Easy for team members to understand and modify

### Deployment Strategy
- **Platform**: Vercel (free tier)
- **Why Vercel**:
  - Zero-config deployment for Next.js
  - Automatic HTTPS
  - Global CDN
  - Preview deployments for pull requests
  - Excellent performance out of the box
- **Workflow**: Push to GitHub → Vercel auto-deploys
- **Domain**: Free `.vercel.app` subdomain (can add custom domain later)

## Component Structure

### Page Layout (`src/app/page.tsx`)
Single-page application with sections in order:
1. Hero (with countdown)
2. About
3. Strava Activity
4. Event Information
5. Footer

### Components (`src/components/`)

#### `CountdownTimer.tsx`
- **Purpose**: Real-time countdown to July 16, 2026 00:00:00 Turkey Time (GMT+3)
- **Features**:
  - Updates every second
  - Displays days, hours, minutes, seconds
  - Responsive sizing
  - Handles timezone properly
- **Implementation**: Uses `useState` and `useEffect` with `setInterval`

#### `Hero.tsx`
- **Purpose**: Eye-catching header with team name and countdown
- **Features**:
  - Full-width background image (underwater hockey action)
  - Gradient overlay for text readability
  - Team title: "U19 USA Underwater Hockey"
  - Subtitle: "Road to Turkey 2026"
  - Integrated CountdownTimer component
- **Design**: Water-themed, athletic, inspiring

#### `StravaSection.tsx`
- **Purpose**: Display team training activity from Strava
- **Features**:
  - Two iframes (Activity feed + Summary stats)
  - Responsive layout:
    - Desktop: Side-by-side (50/50)
    - Mobile: Stacked vertically
  - Proper spacing and borders
- **Important**: Don't modify iframe URLs or attributes

#### `AboutSection.tsx`
- **Purpose**: Brief team description and official logos
- **Content**:
  - Placeholder text: "The U19 USA Men's Underwater Hockey team is training hard for the 2026 CMAS World Championship in Turkey. Follow our journey as we prepare to compete against the world's best young athletes."
  - Logo display areas for CMAS and Turkish Federation
- **Note**: Text can be easily updated by team

#### `EventInfo.tsx`
- **Purpose**: World Championship details
- **Content**:
  - Event name
  - Dates: July 16-26, 2026
  - Location: Gebze / Kocaeli, Turkey
  - Link to official CMAS event page
- **Design**: Clean card layout, easy to scan

#### `Footer.tsx`
- **Purpose**: Simple footer with copyright
- **Content**:
  - Copyright notice
  - Placeholder for future social links
- **Design**: Minimal, professional

## Important Implementation Details

### Countdown Timer
```typescript
// Target date in Turkey timezone (GMT+3)
const targetDate = new Date('2026-07-16T00:00:00+03:00');

// Calculate time remaining
const now = new Date();
const diff = targetDate.getTime() - now.getTime();

// Convert to days, hours, minutes, seconds
const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((diff % (1000 * 60)) / 1000);
```

**Critical**: Always use Turkey time (GMT+3) for the event date.

### Strava Embeds
The iframe codes provided by the user must be preserved exactly as-is. They include:
- `allowtransparency='true'` - Required for Strava styling
- Specific heights (454px for activities, 160px for summary)
- Club-specific URLs with authentication tokens

**DO NOT**:
- Change the iframe URLs
- Remove the allowtransparency attribute
- Modify the height values without testing

### Color Palette
- **Primary Blue**: `#0A4C6D` - Deep underwater blue
- **Accent Cyan**: `#00D9FF` - Bright, energetic aqua
- **USA Red**: `#DC143C` - Patriotic accent
- **White**: `#FFFFFF` - Clean backgrounds
- **Light Gray**: `#F3F4F6` - Alternate sections
- **Dark Navy**: `#1E3A5F` - Text and headings

**Design Philosophy**: Water theme + Athletic + USA pride

### Typography
- **Headings**: Inter (bold weights for impact)
- **Body**: Inter (regular weights for readability)
- **Countdown**: Extra bold, large display sizes

### Responsive Design
- **Mobile** (< 640px): Stack all elements vertically, larger touch targets
- **Tablet** (640px - 1024px): Maintain stacking, increase spacing
- **Desktop** (> 1024px): Side-by-side Strava widgets, full-width hero

**Mobile-First Approach**: Design for mobile, enhance for desktop.

## Content Update Guidelines

### For Team Members (Non-Technical)

#### Updating Text Content
1. Navigate to GitHub repository
2. Use GitHub web editor to modify files:
   - About section: `src/components/AboutSection.tsx`
   - Event info: `src/components/EventInfo.tsx`
3. Create a pull request
4. Coach/admin reviews and merges
5. Vercel auto-deploys (~2 minutes)

#### Adding Photos
1. Upload images to `/public/images/` folder via GitHub
2. Update component to reference: `/images/your-photo.jpg`
3. Use Next.js Image component for optimization

#### Best Practices
- Keep text concise and focused
- Optimize images before uploading (max 1MB)
- Test changes on mobile after deployment
- Don't modify Strava iframe code

### For Technical Team Members

#### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

#### Making Changes
1. Create feature branch: `git checkout -b update/feature-name`
2. Make changes locally
3. Test with `npm run dev`
4. Commit: `git commit -m "Description of changes"`
5. Push: `git push origin update/feature-name`
6. Create pull request on GitHub
7. After merge, Vercel deploys automatically

#### Adding New Components
- Place in `src/components/`
- Follow existing naming conventions
- Use TypeScript
- Keep mobile-first responsive design
- Import and use in `src/app/page.tsx`

## Future Roadmap

### Phase 2 (Post-Launch)
- [ ] Team roster with player profiles
- [ ] Photo gallery from training/competitions
- [ ] Training schedule/calendar integration
- [ ] News/announcements section with dates

### Phase 3 (Advanced Features)
- [ ] Admin dashboard for easy content updates
- [ ] Contact form for inquiries
- [ ] Integration with USA Underwater Hockey federation
- [ ] Multi-language support (English/Turkish)

### Ideas for Later
- Blog posts about training progress
- Video highlights from competitions
- Sponsor acknowledgment section
- Fan engagement features

## Do's and Don'ts

### DO ✅
- Keep mobile-first responsive design in all components
- Maintain the water-themed color palette
- Optimize all images before adding them
- Test on mobile devices after changes
- Keep the countdown prominent and accurate
- Preserve Strava iframe functionality
- Write semantic, accessible HTML
- Use TypeScript for type safety
- Keep content appropriate for a youth sports team

### DON'T ❌
- Don't break the Strava embed codes
- Don't use large unoptimized images
- Don't add heavy dependencies unnecessarily
- Don't change the countdown target date without verification
- Don't make the site heavy (keep < 2s load time)
- Don't sacrifice mobile experience for desktop features
- Don't add inappropriate content (this is for youth athletes)
- Don't hardcode sensitive information (API keys, etc.)

## Performance Guidelines

### Image Optimization
- Always use Next.js `<Image>` component
- Provide width and height attributes
- Use WebP format when possible
- Lazy load images below the fold

### Code Optimization
- Keep bundle size small
- Lazy load Strava iframes
- Use Tailwind's JIT mode
- Minimize client-side JavaScript

### Target Metrics (Lighthouse)
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

## Testing Checklist

### Before Every Deployment
- [ ] Countdown displays correct time to July 16, 2026
- [ ] Both Strava widgets load and display properly
- [ ] Site is responsive on mobile (375px width)
- [ ] Site is responsive on tablet (768px width)
- [ ] Site is responsive on desktop (1280px+ width)
- [ ] All links work correctly
- [ ] Images load and are optimized
- [ ] No console errors in browser
- [ ] Page loads in < 2 seconds
- [ ] Text is readable on all screen sizes

### After Deployment
- [ ] Visit live URL and verify all features
- [ ] Test on real mobile device
- [ ] Check Strava embeds work from production domain
- [ ] Verify SEO meta tags with social sharing
- [ ] Run Lighthouse audit (aim for 90+ scores)

## Common Issues & Solutions

### Strava Widgets Not Loading
- Check internet connection
- Verify iframe URLs haven't been modified
- Check for Content Security Policy issues
- Ensure allowtransparency attribute is present

### Countdown Not Updating
- Check browser console for JavaScript errors
- Verify target date is correctly formatted
- Ensure useEffect cleanup is working properly
- Check timezone handling (should be GMT+3)

### Mobile Layout Issues
- Test with Chrome DevTools device emulation
- Verify Tailwind breakpoints (sm:, md:, lg:)
- Check for hardcoded widths that don't scale
- Ensure text is readable at 375px width

### Deployment Fails
- Check build logs in Vercel dashboard
- Verify package.json has all dependencies
- Run `npm run build` locally to catch errors
- Check for TypeScript errors

## Repository Information

- **Location**: `/Users/cochin/Documents/U19UWHTeam`
- **Remote**: (Connect to GitHub after initial commit)
- **Main Branch**: `main`
- **Deployment**: Vercel (auto-deploy from main)

## Project Context

This is a youth sports team website, so all content and interactions should be:
- **Professional**: Appropriate for athletes, parents, coaches
- **Positive**: Focus on team spirit, training, and achievement
- **Safe**: No collection of personal information beyond what's necessary
- **Inclusive**: Welcoming to supporters and interested parties

## Contact & Maintenance

### Primary Maintainer
- Coach of U19 USA UWH team
- Technical and content updates managed through GitHub

### Team Collaboration
- Multiple team members can contribute via pull requests
- Coach reviews and approves all changes
- Documentation provided for non-technical team members

### Getting Help
- Check this file first for guidance
- Review component code for examples
- Create GitHub issues for bugs or feature requests
- Reach out to technical team members for complex changes

---

**Last Updated**: January 2026
**Next Review**: Before Worlds 2026 (July 2026)

## Notes for AI Assistants

When working on this project:
1. Always preserve the Strava iframe embed codes exactly as provided
2. Maintain mobile-first responsive design in all changes
3. Keep the water-themed color palette consistent
4. The countdown date (July 16, 2026, GMT+3) is critical - don't change it
5. This is for a youth sports team - keep all content appropriate
6. Performance matters - keep the site fast and lightweight
7. Team members may not be technical - make updates intuitive
8. Test on mobile devices - athletes will check on phones
9. Future features are documented in the roadmap - don't add them unless requested
10. Follow the established component structure and naming conventions
