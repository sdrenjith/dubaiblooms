import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import Settings from '../models/Settings.js';
import { DEFAULT_HOMEPAGE, DEFAULT_LISTING } from './homepageDefaults.js';
import { DEFAULT_PRIVACY_POLICY_HTML } from './privacyPolicyDefaults.js';

/** Thematic Unsplash hero crops for seed articles (ixlib required by CDN). */
function editorialHero(photoId: string): string {
  const id = photoId.startsWith('photo-') ? photoId : `photo-${photoId}`;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=800&q=80&ixlib=rb-4.0.3`;
}

const categories = [
  { name: 'News', slug: 'news', description: 'Latest news and updates from Dubai', order: 1, showInMainMenu: true },
  { name: 'Things To Do', slug: 'things-to-do', description: 'Best activities and experiences in Dubai', order: 2, showInMainMenu: true },
  { name: 'Food & Drink', slug: 'food-drink', description: 'Restaurants, cafes, and culinary experiences', order: 3, showInMainMenu: true },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Fashion, wellness, and living in Dubai', order: 4, showInMainMenu: true },
  { name: 'Culture', slug: 'culture', description: 'Arts, heritage, and cultural events', order: 5, showInMainMenu: true },
  { name: 'Travel', slug: 'travel', description: 'Travel guides and destination highlights', order: 6, showInMainMenu: true },
];

const articleTemplates = [
  {
    title: 'Dubai Reveals a Landmark Vertical Garden Tower for the Future Skyline',
    excerpt: 'A stunning new architectural marvel transforms the skyline with over 100,000 living plants cascading down 60 floors of glass and steel.',
    content: '<p>Dubai has once again pushed the boundaries of urban innovation with the grand reveal of the <strong>Bloom Tower</strong>, a 60-story residential skyscraper that doubles as the world\'s largest vertical garden.</p><p>The tower, located in the heart of Dubai Marina, features over 100,000 carefully curated plants from 450 different species, all maintained by an AI-powered irrigation system that reduces water consumption by 70% compared to traditional methods.</p><p>"This is more than architecture — it\'s a living, breathing ecosystem," said lead architect Fatima Al Rashid during the unveiling ceremony. "Every resident will wake up surrounded by nature, 200 meters above the ground."</p><h2>Key Features</h2><ul><li>Self-sustaining micro-climate system</li><li>Solar-powered energy grid</li><li>Rooftop biodiversity park</li><li>Community farming terraces on every 10th floor</li></ul><p>The Bloom Tower is expected to become one of Dubai\'s most photographed landmarks, attracting visitors from around the globe who want to experience the future of sustainable luxury living.</p>',
    featuredImage: editorialHero('1593270797842-4b8e6cecd2b2'),
    tags: ['architecture', 'sustainability', 'dubai marina'],
    isFeatured: true,
    categoryIndex: 0,
  },
  {
    title: 'Hidden Shorelines: Dubai Beach Clubs Worth Discovering Right Now',
    excerpt: 'From secret coves to rooftop pools, discover the most exclusive and under-the-radar beach clubs that locals swear by.',
    content: '<p>While everyone knows about the famous public beaches and luxury hotel pools, Dubai has a growing collection of <strong>hidden beach clubs</strong> that offer something truly special.</p><p>We\'ve spent months exploring every coastline, talking to insiders, and testing cocktails (someone had to do it) to bring you the definitive list of Dubai\'s best-kept secrets.</p><h2>1. Coral Bay Lounge</h2><p>Tucked behind the Palm Jumeirah\'s quieter east crescent, this members-only club features an infinity pool that seemingly melts into the Arabian Gulf. The sunset views are unmatched.</p><h2>2. Salt & Sand</h2><p>A bohemian-chic retreat in Umm Suqeim, Salt & Sand combines barefoot luxury with farm-to-table dining. Think organic smoothie bowls by the shore and yoga at sunrise.</p><h2>3. The Dune Club</h2><p>Located just outside the city in a converted desert camp, this unique venue offers dune-side pools, fire pit lounges, and stargazing sessions with resident astronomers.</p>',
    featuredImage: editorialHero('1507525428034-b723cf961d3e'),
    tags: ['beach clubs', 'luxury', 'hidden gems'],
    isFeatured: true,
    categoryIndex: 1,
  },
  {
    title: 'Inside Dubai\'s Most Anticipated Michelin-Starred Dining Opening',
    excerpt: 'Chef Nobu Tanaka brings a revolutionary fusion of Japanese precision and Emirati flavors to Downtown Dubai\'s most anticipated culinary opening.',
    content: '<p>The wait is finally over. <strong>Saffron & Steel</strong>, the highly anticipated restaurant from Chef Nobu Tanaka, has opened its doors on the 72nd floor of the Burj Vista tower, and it was worth every moment of anticipation.</p><p>The restaurant marries the precision of Japanese kaiseki cuisine with the bold, aromatic flavors of traditional Emirati cooking — a combination that sounds improbable on paper but sings on the palate.</p><h2>The Experience</h2><p>From the moment you step out of the private elevator, you\'re transported. The 80-seat dining room is designed to feel like a modern desert oasis, with flowing water features, warm amber lighting, and floor-to-ceiling windows offering panoramic views of the Burj Khalifa.</p><h2>Must-Try Dishes</h2><ul><li><strong>Wagyu Machboos</strong> — A5 wagyu slow-cooked with traditional spice blend</li><li><strong>Sashimi Garden</strong> — Market fish with Arabic microgreens and date vinaigrette</li><li><strong>Gold Mochi</strong> — 24k gold-leaf dessert with saffron ice cream</li></ul>',
    featuredImage: editorialHero('1414235077428-338989a2e8c0'),
    tags: ['michelin', 'fine dining', 'japanese', 'emirati'],
    isFeatured: true,
    categoryIndex: 2,
  },
  {
    title: 'Dubai\'s Smart City Vision Reaches a Defining New Milestone',
    excerpt: 'The emirate announces that 80% of government services are now fully AI-powered, making it the most digitally advanced city in the Middle East.',
    content: '<p>Dubai\'s ambitious <strong>Smart City 2030</strong> initiative has reached a landmark milestone, with officials announcing that 80% of all government services are now fully automated using artificial intelligence.</p><p>The achievement places Dubai firmly at the forefront of global digital governance, surpassing cities like Singapore, Seoul, and Helsinki in the latest Smart City Index rankings.</p><h2>What This Means for Residents</h2><p>For the average Dubai resident, this translates to faster processing times, reduced paperwork, and 24/7 access to services that previously required in-person visits. Visa renewals, business licensing, and even healthcare appointments are now handled through a unified AI platform.</p><p>"We\'re not just digitizing old processes — we\'re reimagining what government service can be," said the Director of Digital Dubai.</p>',
    featuredImage: editorialHero('1451187580459-43490279c0fa'),
    tags: ['smart city', 'AI', 'technology', 'government'],
    isFeatured: false,
    categoryIndex: 0,
  },
  {
    title: 'Weekend Escape Edit: Dubai\'s Best Luxury Desert Glamping Retreats',
    excerpt: 'Trade the city skyline for a canopy of stars with these luxury desert camping experiences just a short drive from Dubai.',
    content: '<p>There\'s something magical about the desert at night. Away from the city\'s dazzling lights, the Arabian desert reveals a sky so full of stars it feels almost surreal.</p><p>Over the past few years, a new wave of <strong>luxury glamping</strong> experiences has emerged, offering the perfect blend of adventure and comfort for weekend warriors looking to escape the urban buzz.</p><h2>Top Picks</h2><h3>Starlight Dunes Camp</h3><p>Located 90 minutes from Dubai in the Lahbab desert, this boutique camp features just 12 safari-style tents, each with king-sized beds, private terraces, and outdoor showers. The evening entertainment includes traditional Bedouin storytelling and oud music under the stars.</p><h3>Al Maha Wilderness Reserve</h3><p>For those seeking complete immersion in nature, this eco-reserve offers guided wildlife walks, falconry demonstrations, and sunrise camel treks through pristine dune landscapes.</p>',
    featuredImage: editorialHero('1640755668096-4f4c7b8f4410'),
    tags: ['desert', 'glamping', 'weekend', 'outdoor'],
    isFeatured: false,
    categoryIndex: 5,
  },
  {
    title: 'Brew Culture: The Rise of Dubai\'s Independent Specialty Coffee Scene',
    excerpt: 'Forget chain cafes — a new generation of specialty roasters is transforming how Dubai drinks its coffee, one pour-over at a time.',
    content: '<p>Walk through the streets of Al Quoz or Jumeirah and you\'ll notice something brewing — literally. Dubai\'s <strong>independent coffee scene</strong> has exploded, with over 50 new specialty cafés opening in the past year alone.</p><p>These aren\'t your typical grab-and-go spots. We\'re talking single-origin Ethiopian beans roasted on-site, cold brew aged in oak barrels, and baristas who can explain the terroir of your cup with the same passion as a sommelier.</p><h2>Where to Start</h2><ul><li><strong>Nightjar Coffee</strong> — The OG of Dubai specialty coffee, consistently excellent</li><li><strong>% Arabica</strong> — Minimalist Japanese chain with impeccable standards</li><li><strong>RAW Coffee Company</strong> — Al Quoz pioneers with a cult following</li></ul>',
    featuredImage: editorialHero('1531442104178-bdad57f51621'),
    tags: ['coffee', 'cafes', 'al quoz', 'specialty'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Dubai Art Week 2026: The Essential Guide to This Year\'s Must-See Program',
    excerpt: 'The annual celebration of contemporary art returns with over 200 exhibitions, installations, and performances across the city.',
    content: '<p><strong>Dubai Art Week</strong> is back and bigger than ever. Running from March 15-22, this year\'s edition features over 200 exhibitions, pop-up galleries, street art installations, and live performances scattered across the city.</p><p>From the established galleries of Alserkal Avenue to surprise pop-ups in abandoned warehouses, Dubai Art Week has evolved from a niche cultural event into one of the Middle East\'s most important creative gatherings.</p><h2>Highlights</h2><ul><li><strong>The Mirror Garden</strong> — A massive interactive installation in Zabeel Park using 10,000 reflective panels</li><li><strong>Voices of the Gulf</strong> — Group exhibition featuring 30 emerging Emirati artists</li><li><strong>Night Art Walk</strong> — Self-guided evening tour through D3 with live music and food trucks</li></ul>',
    featuredImage: editorialHero('1640350168509-756f1ef84b37'),
    tags: ['art', 'exhibitions', 'culture', 'alserkal'],
    isFeatured: true,
    categoryIndex: 4,
  },
  {
    title: 'Sustainable Style in Dubai: Inside the City\'s New Fashion Movement',
    excerpt: 'Local designers are leading a green revolution in fashion, proving that sustainability and luxury can go hand in hand.',
    content: '<p>The fashion industry is one of the world\'s biggest polluters, but a growing movement of <strong>Dubai-based designers</strong> is proving that style doesn\'t have to come at the planet\'s expense.</p><p>From upcycled couture to biodegradable activewear, these innovative labels are rewriting the rules of Middle Eastern fashion while staying true to the region\'s love of luxury and craftsmanship.</p><h2>Brands to Watch</h2><h3>Desert Rose Collective</h3><p>Founded by Sheikha Amal, this label creates stunning evening wear from recycled ocean plastics and organic silk. Each piece is handcrafted by artisans in a solar-powered atelier.</p><h3>Thread & Thorn</h3><p>Menswear label specializing in business attire made from sustainable bamboo and hemp fabrics. Their suits are as sharp as any Savile Row offering.</p>',
    featuredImage: editorialHero('1445205170230-053b83016050'),
    tags: ['fashion', 'sustainability', 'eco-friendly'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'Dubai Metro Expansion Now Connects the City\'s Cultural Powerhouses',
    excerpt: 'The expanded Red Line now reaches the Dubai Design District and Alserkal Avenue, making art and culture more accessible than ever.',
    content: '<p>Commuters and culture enthusiasts rejoice — the <strong>Dubai Metro Red Line extension</strong> is now fully operational, adding four new stations that connect some of the city\'s most vibrant cultural hubs.</p><p>The new stations serve Dubai Design District (D3), Alserkal Avenue, Dubai Creek Harbour, and the upcoming Museum Quarter, dramatically improving accessibility to areas that were previously car-dependent.</p><h2>Station Highlights</h2><p>Each station has been designed by a different architect, turning the commute itself into an art experience. The D3 station features a stunning digital ceiling that displays rotating artworks from local creators.</p>',
    featuredImage: editorialHero('1556624651-1f527cdf6508'),
    tags: ['metro', 'transport', 'infrastructure'],
    isFeatured: false,
    categoryIndex: 0,
  },
  {
    title: 'After Dark in Dubai: 10 Rooftop Bars Defining 2026 Nightlife',
    excerpt: 'Sip cocktails above the clouds at these stunning elevated venues, each offering unforgettable views and world-class drinks.',
    content: '<p>Dubai\'s skyline was made for rooftop drinking. From the glittering towers of Downtown to the waterfront glamour of JBR, the city\'s <strong>rooftop bar scene</strong> continues to evolve with increasingly creative concepts.</p><p>We\'ve tested them all (tough job, we know) and ranked the definitive top 10 for 2026.</p><h2>The Top 3</h2><h3>1. Horizon Lounge</h3><p>Perched on the 87th floor of the Address Sky View, this intimate space seats just 40 guests and serves a cocktail menu inspired by the seven emirates.</p><h3>2. Jetty Lounge</h3><p>The One&Only Royal Mirage\'s beachside-meets-rooftop concept remains unmatched for sunset vibes and Arabesque-inspired mixology.</p><h3>3. FIVE Palm Sky Bar</h3><p>The party energy here is infectious, with resident DJs, bottle service, and a pool you can swim in while overlooking the Palm.</p>',
    featuredImage: editorialHero('1623630524058-622b7fa9ecd7'),
    tags: ['bars', 'rooftop', 'nightlife', 'cocktails'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Wellness Escapes Across the UAE: Where to Reset, Recover, and Rebalance',
    excerpt: 'From yoga sanctuaries in the mountains to floating meditation pods, discover the most transformative wellness experiences in the Emirates.',
    content: '<p>In a city known for its fast pace and ambition, the <strong>wellness movement</strong> in Dubai has become a powerful counterbalance — a growing community dedicated to mindfulness, holistic health, and finding balance.</p><p>Whether you\'re a seasoned practitioner or a stressed-out professional looking for a reset, these retreats offer something for everyone.</p><h2>Our Picks</h2><h3>Hatta Serenity Retreat</h3><p>Nestled in the Hajar Mountains, this off-grid retreat combines traditional Ayurvedic practices with modern neuroscience. The signature "digital detox" program is transformative.</p><h3>The Float Lab</h3><p>Located in DIFC, this urban sanctuary features sensory deprivation pods that promise 90 minutes of complete mental reset. It\'s become the secret weapon of Dubai\'s top executives.</p>',
    featuredImage: editorialHero('1544367567-0f2fcb009e0b'),
    tags: ['wellness', 'yoga', 'meditation', 'retreat'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'The Souk Edit: A Modern Insider\'s Guide to Dubai\'s Historic Market Districts',
    excerpt: 'The historic souks of Dubai blend centuries of trading heritage with contemporary culture — here\'s how to experience them like a local.',
    content: '<p>Long before the malls and skyscrapers, there were the <strong>souks</strong> — the beating commercial heart of Dubai. These traditional markets have been drawing traders and travelers for centuries, and today they remain one of the city\'s most authentic and rewarding experiences.</p><h2>The Gold Souk</h2><p>Home to over 300 retailers, the Deira Gold Souk is the world\'s largest gold market. The glittering displays are breathtaking, and prices are often surprisingly competitive thanks to the UAE\'s zero tax on gold.</p><h2>The Spice Souk</h2><p>Just steps away, the aroma of the Spice Souk hits you before you see it. Sacks of saffron, frankincense, dried roses, and exotic blends line the narrow pathways. Vendors are happy to chat and share recipes.</p><h2>Tips for Visiting</h2><ul><li>Visit in the morning for the best selection</li><li>Haggling is expected — start at 50% of the asking price</li><li>Take the abra (water taxi) across Dubai Creek for the full experience</li></ul>',
    featuredImage: editorialHero('1525289722380-f5bf1653d504'),
    tags: ['souks', 'heritage', 'traditional', 'markets'],
    isFeatured: true,
    categoryIndex: 4,
  },
  {
    title: 'Inside Al Quoz Creative Season: Studios, Pop-Ups, and Late-Night Performances',
    excerpt: 'A district-wide program turns warehouses into immersive galleries, maker labs, and independent performance spaces.',
    content: '<p>Al Quoz has entered its most ambitious creative season yet, with a six-week lineup of <strong>studio residencies, design pop-ups, and live sets</strong> staged across the district.</p><p>Curated in collaboration with local galleries and independent collectives, the program is intentionally cross-disciplinary: visual art, fashion, digital media, and live performance sit side by side.</p><h2>What to Prioritize</h2><ul><li>Late-night projection mapping in converted industrial courtyards</li><li>Hands-on ceramic and printmaking masterclasses</li><li>Curator-led walkthroughs focused on emerging Gulf artists</li></ul><p>Expect strong crowds on weekends, so weekday evenings are the best window for a quieter visit.</p>',
    featuredImage: editorialHero('1513364776144-60967b0f800f'),
    tags: ['al quoz', 'art', 'design', 'events'],
    isFeatured: true,
    categoryIndex: 4,
  },
  {
    title: 'The New Family Weekend Blueprint: Parks, Culture, and Indoor Discovery',
    excerpt: 'A practical city guide for planning meaningful family weekends without defaulting to crowded malls.',
    content: '<p>Dubai now offers a wide mix of <strong>family-friendly programming</strong> that combines fun with learning, from outdoor science trails to museum-led activity sessions.</p><p>This editorial blueprint organizes your weekend by energy level: active mornings, cooler indoor afternoons, and easy sunset stops.</p><h2>Recommended Flow</h2><ul><li>Early walk and cycling loops in Safa Park</li><li>Hands-on exhibits and children workshops in Al Shindagha</li><li>Sunset picnic points with skyline views along Creek Harbour</li></ul><p>Booking timed tickets ahead can cut queue times significantly during school breaks.</p>',
    featuredImage: editorialHero('1759301249586-53df26931779'),
    tags: ['family', 'weekend', 'activities'],
    isFeatured: false,
    categoryIndex: 1,
  },
  {
    title: 'Dubai Brunch Guide 2026: New Menus, Best Terraces, and Smart Booking Tips',
    excerpt: 'A citywide edit of brunch programs that balance food quality, atmosphere, and value.',
    content: '<p>Brunch remains one of Dubai\'s strongest social rituals, but the format has evolved. New concepts focus less on volume and more on <strong>chef-led menus, live counters, and experience design</strong>.</p><p>We reviewed this season\'s headline openings and tested terrace comfort, service pacing, and menu depth.</p><h2>Standout Formats</h2><ul><li>Chef tasting brunches with rotating regional themes</li><li>Sunset terrace brunches designed for cooler months</li><li>Family-first brunches with dedicated children zones</li></ul><p>For top venues, book 5-7 days early and request shaded perimeter tables.</p>',
    featuredImage: editorialHero('1621523132912-4868ede87fb2'),
    tags: ['brunch', 'food', 'guide'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Remote Work Cafes in Dubai That Actually Support Deep Focus',
    excerpt: 'Reliable power, calm acoustics, strong coffee, and realistic seating policies for productive work sessions.',
    content: '<p>Not every aesthetically pleasing cafe is built for concentration. We mapped a shortlist of Dubai spots that consistently deliver <strong>reliable Wi-Fi, practical seating, and low ambient noise</strong>.</p><p>This guide also flags peak-hour patterns and table policies so you can plan around crowd surges.</p><h2>Selection Criteria</h2><ul><li>Average internet stability over a 2-hour session</li><li>Availability of sockets without obstructing walkways</li><li>Menu breadth for long work blocks</li></ul><p>Morning windows between 8:00 and 10:30 remain the most productive at most locations.</p>',
    featuredImage: editorialHero('1509042239860-f550ce710b93'),
    tags: ['lifestyle', 'work', 'cafes'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'Two-Day Coastal Escape: A Refined Abu Dhabi Itinerary from Dubai',
    excerpt: 'A polished short-trip plan with beachfront stays, gallery visits, and dining reservations mapped efficiently.',
    content: '<p>For readers looking beyond city routine, this two-day coastal itinerary offers a smooth <strong>Dubai-to-Abu Dhabi weekend sequence</strong> with minimal transit friction.</p><p>The route balances culture, beachfront downtime, and evening dining while keeping logistics practical for short stays.</p><h2>Day Split</h2><ul><li>Day 1: Louvre Abu Dhabi + waterfront check-in + sunset dinner</li><li>Day 2: Morning beach reset + coffee stop + return by evening</li></ul><p>Driving out before peak Friday traffic can save over an hour on the outbound journey.</p>',
    featuredImage: editorialHero('1542051841857-5f90071e7989'),
    tags: ['travel', 'weekend', 'abu dhabi'],
    isFeatured: true,
    categoryIndex: 5,
  },
  {
    title: 'What to Book This Month: Concerts, Food Festivals, and Design Week Picks',
    excerpt: 'A monthly planner of high-interest events with practical booking guidance and expected sell-out windows.',
    content: '<p>Dubai\'s event calendar moves quickly, and premium tickets can disappear in days. This monthly planner highlights <strong>concerts, culinary festivals, and design programs</strong> worth securing early.</p><p>Each listing includes expected attendance patterns and ideal booking timelines based on previous editions.</p><h2>Planner Highlights</h2><ul><li>Waterfront music weekends with limited VIP inventory</li><li>Chef collaboration dinners with one-night-only menus</li><li>Design week workshops with small-capacity registrations</li></ul><p>Set alerts for release windows and prioritize events with flexible cancellation terms.</p>',
    featuredImage: editorialHero('1470229722913-7c0e2dbbafd3'),
    tags: ['events', 'planner', 'dubai'],
    isFeatured: true,
    categoryIndex: 0,
  },
  {
    title: 'City Playbook: Four New Indoor Activity Hubs for Summer Weekends',
    excerpt: 'From climbing walls to creative maker labs, these new venues make hot-weather weekends easier to plan.',
    content: '<p>As temperatures rise, Dubai\'s indoor activity ecosystem keeps getting stronger. A new crop of <strong>family and friends activity hubs</strong> blends fitness, play, and workshops in climate-controlled spaces.</p><p>These venues are designed for full-session experiences rather than quick visits, making them ideal for weekend planning.</p>',
    featuredImage: editorialHero('1751235600651-94bbbeb29567'),
    tags: ['things to do', 'weekend', 'indoor'],
    isFeatured: false,
    categoryIndex: 1,
  },
  {
    title: 'Sunset Boardwalk Routes: New Waterfront Walks to Try This Season',
    excerpt: 'A practical guide to scenic evening walks with food stops, parking guidance, and crowd timing.',
    content: '<p>Dubai\'s waterfront expansions are creating better <strong>sunset walking circuits</strong> across the city. These routes combine open views, easy access, and nearby dining options for low-effort evenings.</p><p>We mapped distance ranges and ideal start times so readers can pick a route that matches their pace.</p>',
    featuredImage: editorialHero('1607486551087-bd8ff4708483'),
    tags: ['outdoors', 'walks', 'things to do'],
    isFeatured: false,
    categoryIndex: 1,
  },
  {
    title: 'Morning Routines in Dubai: Fitness Clubs Redefining Everyday Wellness',
    excerpt: 'Studios and recovery spaces are now building full morning stacks from mobility to nutrition.',
    content: '<p>A new generation of wellness clubs in Dubai is focusing on complete <strong>morning routine ecosystems</strong> rather than single workouts. Members can now combine training, recovery, and nutrition within one visit.</p><p>The result is a practical lifestyle format that is easier to maintain across busy workweeks.</p>',
    featuredImage: editorialHero('1534438327276-14e5300c3a48'),
    tags: ['lifestyle', 'wellness', 'fitness'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'Museum Nights in Dubai: Late Openings and Curator-Led Experiences',
    excerpt: 'Evening access programs are making cultural spaces more accessible for weekday audiences.',
    content: '<p>Several institutions are now piloting <strong>late-night museum sessions</strong> with smaller group access and guided walkthroughs. The evening format improves accessibility for professionals and students who cannot attend daytime slots.</p><p>Expect more curator-led talks and cross-venue cultural passes over the next cycle.</p>',
    featuredImage: editorialHero('1713779490284-a81ff6a8ffae'),
    tags: ['culture', 'museum', 'events'],
    isFeatured: true,
    categoryIndex: 4,
  },
  {
    title: '48 Hours in Ras Al Khaimah: Nature-First Escape from Dubai',
    excerpt: 'A short-travel itinerary built around mountain trails, beach downtime, and local dining.',
    content: '<p>For readers seeking quick nature contrast, Ras Al Khaimah remains one of the strongest <strong>two-day escape options</strong> from Dubai. This route balances outdoor activity with easy hotel logistics.</p><p>Drive-time planning and reservation timing are the key to keeping the itinerary smooth.</p>',
    featuredImage: editorialHero('1506905925346-21bda4d32df4'),
    tags: ['travel', 'itinerary', 'weekend'],
    isFeatured: false,
    categoryIndex: 5,
  },
  {
    title: 'Airline Upgrade Strategy: Smart Booking Windows from Dubai Airports',
    excerpt: 'Data-backed timing tips for better fares, smoother connections, and higher upgrade chances.',
    content: '<p>Frequent travelers departing Dubai can materially improve outcomes by booking within specific fare windows. This guide outlines <strong>timing patterns, route flexibility, and seat strategy</strong> for regional and long-haul trips.</p><p>Small adjustments in booking behavior can deliver meaningful gains across cost and comfort.</p>',
    featuredImage: editorialHero('1761146052359-c2cd3ab06590'),
    tags: ['travel', 'airline', 'tips'],
    isFeatured: false,
    categoryIndex: 5,
  },
  {
    title: 'Chef Counter Guide: Dubai Restaurants Where the Tasting Menu Shines',
    excerpt: 'An editor-curated shortlist of chef counters built for immersive multi-course experiences.',
    content: '<p>Chef counter dining has become one of Dubai\'s most compelling <strong>fine dining formats</strong>. These seats provide direct interaction with the kitchen and a sharper understanding of menu intent.</p><p>Expect limited availability and tighter seating windows, so early reservations are essential.</p>',
    featuredImage: editorialHero('1600565193348-f74bd3c7ccdf'),
    tags: ['food', 'restaurants', 'fine dining'],
    isFeatured: true,
    categoryIndex: 2,
  },
  {
    title: 'Late-Night Dessert Studios in Dubai Worth the Drive',
    excerpt: 'From plated patisserie to specialty gelato labs, these spots deliver after-hours quality.',
    content: '<p>Dubai\'s dessert scene now extends well beyond mall hours, with a new wave of <strong>late-night dessert studios</strong> focusing on craftsmanship and seasonal ingredients.</p><p>This list prioritizes consistency, menu originality, and quality after 10pm service.</p>',
    featuredImage: editorialHero('1551024506-0bccd828d307'),
    tags: ['desserts', 'food-drink', 'nightlife'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'The New Brasserie Wave: Modern European Menus Landing in Dubai',
    excerpt: 'A practical roundup of new brasseries balancing approachable comfort and premium execution.',
    content: '<p>A fresh set of brasseries is reshaping Dubai\'s casual-premium dining segment. These venues combine <strong>classic European foundations</strong> with regionally tuned menus and stronger beverage programs.</p><p>Go early for quieter service if you want a slower, conversation-friendly meal.</p>',
    featuredImage: editorialHero('1602232037779-30b01ac3c457'),
    tags: ['brasserie', 'food', 'dining'],
    isFeatured: false,
    categoryIndex: 2,
  },
  // Extra desk coverage so every category can show 1 lead + 4 cards with pagination
  {
    title: 'Dubai Policy Brief: What the New Business Rules Mean for Founders',
    excerpt: 'A concise breakdown of licensing updates, visa pathways, and compliance timelines for 2026.',
    content: '<p>Official channels have clarified several <strong>business setup and compliance</strong> adjustments that affect founders operating from Dubai.</p><p>This brief focuses on practical timelines and documentation expectations.</p>',
    featuredImage: editorialHero('1454165804606-c3d57bc86b40'),
    tags: ['news', 'business', 'policy'],
    isFeatured: false,
    categoryIndex: 0,
  },
  {
    title: 'Green Corridor Initiative: How Dubai Is Rewiring Urban Mobility',
    excerpt: 'Cycle lanes, shaded walkways, and last-mile hubs are expanding faster than many residents realize.',
    content: '<p>Dubai\'s mobility planners are stitching together a <strong>green corridor network</strong> aimed at safer micro-mobility and shorter car trips.</p><p>We mapped the corridors most likely to affect daily commutes this year.</p>',
    featuredImage: editorialHero('1558618666-fcd25c85cd64'),
    tags: ['news', 'mobility', 'urban'],
    isFeatured: true,
    categoryIndex: 0,
  },
  {
    title: 'Creek Harbour After Dark: A Calmer Night Walk Route',
    excerpt: 'Lighting upgrades and wider promenades make this one of the best post-dinner strolls in the city.',
    content: '<p>If you want skyline views without nightclub energy, this <strong>evening walking loop</strong> stays pleasantly calm on weeknights.</p><p>We note breeze direction, parking pockets, and the best coffee stop on the return leg.</p>',
    featuredImage: editorialHero('1449824913935-59a10b8d2000'),
    tags: ['things to do', 'walks', 'evening'],
    isFeatured: false,
    categoryIndex: 1,
  },
  {
    title: 'Pickleball Courts in Dubai: Where Beginners Actually Get Court Time',
    excerpt: 'Bookable venues, peak-hour advice, and coaching-friendly locations for new players.',
    content: '<p>Pickleball demand is outpacing supply in several districts. These venues still offer <strong>predictable court access</strong> for beginners.</p><p>We compared pricing, shoe rules, and equipment rental quality.</p>',
    featuredImage: editorialHero('1612872087720-bb876e2e67d1'),
    tags: ['sports', 'things to do', 'fitness'],
    isFeatured: false,
    categoryIndex: 1,
  },
  {
    title: 'Kids Science Weekends: Hands-On Labs Parents Can Book Same-Day',
    excerpt: 'Short workshops that feel like play but teach real physics and ecology concepts.',
    content: '<p>These programs emphasize <strong>tactile experiments</strong> rather than passive demos, which keeps younger children engaged longer.</p><p>Age bands and sibling policies vary, so we listed the essentials.</p>',
    featuredImage: editorialHero('1503676260728-1c00da094a0b'),
    tags: ['family', 'education', 'weekend'],
    isFeatured: true,
    categoryIndex: 1,
  },
  {
    title: 'Olive Oil Tasting Bars: A New Front in Dubai’s Food Scene',
    excerpt: 'Single-origin pours, bread pairings, and staff who can explain harvest years without pretence.',
    content: '<p>Specialty olive oil is having a moment in Dubai tasting rooms modeled after wine bars but with a <strong>shorter learning curve</strong>.</p><p>These are the rooms worth booking for a first visit.</p>',
    featuredImage: editorialHero('1474979266404-7eaacbcd87c5'),
    tags: ['food', 'tasting', 'mediterranean'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Dhow Dinner Cruises: Which Routes Still Feel Special in 2026',
    excerpt: 'Honest notes on timing, music volume, and menu quality across the main operators.',
    content: '<p>Not every dhow experience matches the brochure photography. We separated routes with <strong>consistent service pacing</strong> from the rest.</p><p>Sunset departures remain the strongest overall value category.</p>',
    featuredImage: editorialHero('1544551763-46a013bb70d5'),
    tags: ['dining', 'waterfront', 'experience'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Sleep Hygiene in High-Rise Living: Acoustics, Light, and Airflow',
    excerpt: 'Practical fixes for Dubai apartments where HVAC and glazing shape how well you rest.',
    content: '<p>Tower living introduces predictable sleep disruptors: compressor noise, corridor light leak, and dry cooled air.</p><p>This guide prioritizes <strong>low-cost adjustments</strong> before expensive retrofits.</p>',
    featuredImage: editorialHero('1522771739844-6a9f6d5f14af'),
    tags: ['wellness', 'home', 'sleep'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'Capsule Wardrobe for Gulf Heat: Twelve Pieces, Four Months',
    excerpt: 'Breathable fabrics, neutral layers, and shoes that survive marble and sand alike.',
    content: '<p>A heat-proof capsule should minimize friction between work, weekends, and travel days.</p><p>These twelve pieces cover most Dubai social contexts without feeling repetitive.</p>',
    featuredImage: editorialHero('1490481651871-ab68de25d43d'),
    tags: ['fashion', 'style', 'summer'],
    isFeatured: true,
    categoryIndex: 3,
  },
  {
    title: 'Heritage House Tours: Small Museums Quietly Doing Excellent Work',
    excerpt: 'Restored courtyard homes with curator-led visits that run under ninety minutes.',
    content: '<p>These heritage houses reward visitors who want <strong>context-rich storytelling</strong> without all-day museum fatigue.</p><p>Booking windows and photography policies differ, so read the fine print.</p>',
    featuredImage: editorialHero('1543364972-12a04a63ce01'),
    tags: ['culture', 'heritage', 'tours'],
    isFeatured: false,
    categoryIndex: 4,
  },
  {
    title: 'Independent Film Nights: Programmers Worth Following This Season',
    excerpt: 'Where to find subtitles, director Q&As, and seating that does not ruin the experience.',
    content: '<p>Dubai\'s indie film circuit is more fragmented than the multiplex calendar suggests.</p><p>We tracked programmers who consistently secure <strong>strong festival picks</strong> early.</p>',
    featuredImage: editorialHero('1489599849927-2ee91cede3ba'),
    tags: ['film', 'culture', 'night'],
    isFeatured: false,
    categoryIndex: 4,
  },
  {
    title: 'Jebel Jais Day Trip: A Tighter Itinerary for First-Time Visitors',
    excerpt: 'Start times, fuel stops, and where to eat before the mountain roads get busy.',
    content: '<p>Jebel Jais rewards early starts. This itinerary keeps driving segments short and builds in <strong>photo stops</strong> that do not derail the day.</p><p>Weather windows matter, especially in summer months.</p>',
    featuredImage: editorialHero('1469474968028-56623f02e42e'),
    tags: ['travel', 'mountains', 'uae'],
    isFeatured: true,
    categoryIndex: 5,
  },
  {
    title: 'Fujairah Friday: Snorkel-Friendly Beaches Within Three Hours',
    excerpt: 'Calm water pockets, hire gear quality, and lunch spots that handle sandy feet.',
    content: '<p>East coast beaches can vary sharply in amenities. These stretches balance <strong>snorkel-friendly clarity</strong> with reasonable drive time from Dubai.</p><p>Check marine conditions the morning of your trip.</p>',
    featuredImage: editorialHero('1667747812164-ff6ac58037cc'),
    tags: ['travel', 'beach', 'snorkel'],
    isFeatured: false,
    categoryIndex: 5,
  },
  {
    title: 'Newsroom Notebook: Five Dubai Data Points Worth Watching This Quarter',
    excerpt: 'Tourism mix, office occupancy signals, and retail footfall markers in one quick scan.',
    content: '<p>We distilled public and industry-reported indicators into a <strong>five-point watch list</strong> for general readers.</p><p>Numbers move quickly; treat this as orientation, not prediction.</p>',
    featuredImage: editorialHero('1551288049-bebda4e38f71'),
    tags: ['news', 'economy', 'analysis'],
    isFeatured: false,
    categoryIndex: 0,
  },
  {
    title: 'Aquarium Meets Art: Immersive Installations Landing at Malls and D3',
    excerpt: 'Family-friendly shows that still feel designed for adult attention spans.',
    content: '<p>Developers are experimenting with <strong>hybrid aquarium and projection</strong> formats that travel well between districts.</p><p>Ticket tiers and session lengths vary; we highlighted the least rushed options.</p>',
    featuredImage: editorialHero('1592072467526-0506c6530493'),
    tags: ['things to do', 'art', 'family'],
    isFeatured: false,
    categoryIndex: 1,
  },
  {
    title: 'Zero-Proof Cocktails: Bars Taking Non-Alcoholic Lists Seriously',
    excerpt: 'Shrubs, ferments, and tea infusions that are not just juice afterthoughts.',
    content: '<p>A short list of venues where the NA menu receives the same garnish discipline as the main list.</p><p>Perfect for weeknights when you still want a polished room.</p>',
    featuredImage: editorialHero('1681579289862-42080bf4509a'),
    tags: ['beverages', 'bars', 'lifestyle'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Executive Burnout Signals: When a Weekend Is Not Enough',
    excerpt: 'Clinicians and coaches on early warning signs and low-friction first steps.',
    content: '<p>Burnout often masquerades as normal ambition fatigue. These signals suggest when to <strong>escalate beyond rest alone</strong>.</p><p>Resources include Dubai-based support pathways.</p>',
    featuredImage: editorialHero('1573496359142-b8d87734a5a2'),
    tags: ['health', 'work', 'mindfulness'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'Public Sculpture Walk: New Commissions Along the Waterfront Arc',
    excerpt: 'A self-guided route with shade stops and the best times to avoid harsh light.',
    content: '<p>Recent commissions reward slow viewing. This walk strings together <strong>accessible viewing angles</strong> without doubling back too often.</p><p>Bring water even in winter afternoons.</p>',
    featuredImage: editorialHero('1561214115-f2f134cc4912'),
    tags: ['public art', 'culture', 'walking'],
    isFeatured: true,
    categoryIndex: 4,
  },
  {
    title: 'Road Trip Playlist and Pit Stops: Dubai to Liwa Without Fatigue',
    excerpt: 'Fuel, tyre checks, and the one cafe worth the slight detour.',
    content: '<p>Long desert drives demand boring preparation. This checklist keeps the focus on <strong>safety margins</strong> and calm arrival times.</p><p>Wind conditions can change quickly; verify before you go.</p>',
    featuredImage: editorialHero('1509316785289-025f5b846b35'),
    tags: ['travel', 'road trip', 'desert'],
    isFeatured: false,
    categoryIndex: 5,
  },
];

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('📦 Connected to MongoDB for seeding...');

    // Drop existing collections to avoid stale index issues
    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.dropCollection(col.name);
    }
    console.log('🗑️  Cleared existing data and indexes');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@dubaiblooms.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin user created (admin@dubaiblooms.com / admin123)');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 ${createdCategories.length} categories created`);

    // Create articles with pre-generated slugs and reading times
    const articles = articleTemplates.map((tmpl, index) => {
      const wordCount = tmpl.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      return {
        title: tmpl.title,
        slug: generateSlug(tmpl.title),
        content: tmpl.content,
        excerpt: tmpl.excerpt,
        featuredImage: tmpl.featuredImage,
        category: createdCategories[tmpl.categoryIndex]!._id,
        tags: tmpl.tags,
        author: admin._id,
        isFeatured: tmpl.isFeatured,
        isPublished: true,
        publishedAt: new Date(Date.now() - index * 86400000),
        readingTime: Math.max(1, Math.ceil(wordCount / 200)),
        views: Math.floor(Math.random() * 5000) + 100,
        seo: {
          metaTitle: tmpl.title,
          metaDescription: tmpl.excerpt,
          ogImage: tmpl.featuredImage,
        },
      };
    });

    await Article.insertMany(articles);
    console.log(`📝 ${articles.length} articles created`);

    // Create settings
    await Settings.create({
      siteName: 'Dubai Blooms',
      tagline: 'The Pulse of Dubai',
      contactInfo: {
        email: 'marketing@dubaiblooms.ae',
        phone: '+971 50 780 3538',
        address: 'Media City, Dubai, UAE',
      },
      socialLinks: {
        facebook: 'https://facebook.com/dubaiblooms',
        twitter: 'https://twitter.com/dubaiblooms',
        instagram: 'https://www.instagram.com/dubai.blooms?igsh=MXM0bGR4ZGhhZjByNg==',
        linkedin: 'https://linkedin.com/company/dubaiblooms',
      },
      footerText: '© 2026 Dubai Blooms. All rights reserved.',
      privacyPolicyHtml: DEFAULT_PRIVACY_POLICY_HTML,
      notifications: {
        enabled: true,
        title: 'Editor Alert',
        message: 'Breaking stories and premium updates are now live.',
      },
      subscribers: [
        { email: 'ali.reader@example.com', source: 'website-footer' },
        { email: 'sara.explorer@example.com', source: 'website-footer' },
        { email: 'omar.travels@example.com', source: 'homepage-banner' },
      ],
      listing: DEFAULT_LISTING,
      homepage: DEFAULT_HOMEPAGE,
    });
    console.log('⚙️  Settings created');

    console.log('\n✅ Seed completed successfully!');
    console.log('   Login: admin@dubaiblooms.com / admin123\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
};

seed();
