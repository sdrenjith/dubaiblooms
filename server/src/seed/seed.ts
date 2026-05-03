import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import Settings from '../models/Settings.js';

dotenv.config();

const categories = [
  { name: 'News', slug: 'news', description: 'Latest news and updates from Dubai', order: 1 },
  { name: 'Things To Do', slug: 'things-to-do', description: 'Best activities and experiences in Dubai', order: 2 },
  { name: 'Food & Drink', slug: 'food-drink', description: 'Restaurants, cafes, and culinary experiences', order: 3 },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Fashion, wellness, and living in Dubai', order: 4 },
  { name: 'Culture', slug: 'culture', description: 'Arts, heritage, and cultural events', order: 5 },
  { name: 'Travel', slug: 'travel', description: 'Travel guides and destination highlights', order: 6 },
];

const articleTemplates = [
  {
    title: 'Dubai Unveils the World\'s Largest Vertical Garden Tower',
    excerpt: 'A stunning new architectural marvel transforms the skyline with over 100,000 living plants cascading down 60 floors of glass and steel.',
    content: '<p>Dubai has once again pushed the boundaries of urban innovation with the grand reveal of the <strong>Bloom Tower</strong>, a 60-story residential skyscraper that doubles as the world\'s largest vertical garden.</p><p>The tower, located in the heart of Dubai Marina, features over 100,000 carefully curated plants from 450 different species, all maintained by an AI-powered irrigation system that reduces water consumption by 70% compared to traditional methods.</p><p>"This is more than architecture — it\'s a living, breathing ecosystem," said lead architect Fatima Al Rashid during the unveiling ceremony. "Every resident will wake up surrounded by nature, 200 meters above the ground."</p><h2>Key Features</h2><ul><li>Self-sustaining micro-climate system</li><li>Solar-powered energy grid</li><li>Rooftop biodiversity park</li><li>Community farming terraces on every 10th floor</li></ul><p>The Bloom Tower is expected to become one of Dubai\'s most photographed landmarks, attracting visitors from around the globe who want to experience the future of sustainable luxury living.</p>',
    featuredImage: 'https://picsum.photos/seed/dubai-tower/1200/800',
    tags: ['architecture', 'sustainability', 'dubai marina'],
    isFeatured: true,
    categoryIndex: 0,
  },
  {
    title: 'The Ultimate Guide to Dubai\'s Hidden Beach Clubs',
    excerpt: 'From secret coves to rooftop pools, discover the most exclusive and under-the-radar beach clubs that locals swear by.',
    content: '<p>While everyone knows about the famous public beaches and luxury hotel pools, Dubai has a growing collection of <strong>hidden beach clubs</strong> that offer something truly special.</p><p>We\'ve spent months exploring every coastline, talking to insiders, and testing cocktails (someone had to do it) to bring you the definitive list of Dubai\'s best-kept secrets.</p><h2>1. Coral Bay Lounge</h2><p>Tucked behind the Palm Jumeirah\'s quieter east crescent, this members-only club features an infinity pool that seemingly melts into the Arabian Gulf. The sunset views are unmatched.</p><h2>2. Salt & Sand</h2><p>A bohemian-chic retreat in Umm Suqeim, Salt & Sand combines barefoot luxury with farm-to-table dining. Think organic smoothie bowls by the shore and yoga at sunrise.</p><h2>3. The Dune Club</h2><p>Located just outside the city in a converted desert camp, this unique venue offers dune-side pools, fire pit lounges, and stargazing sessions with resident astronomers.</p>',
    featuredImage: 'https://picsum.photos/seed/beach-club/1200/800',
    tags: ['beach clubs', 'luxury', 'hidden gems'],
    isFeatured: true,
    categoryIndex: 1,
  },
  {
    title: 'Inside Dubai\'s Newest Michelin-Starred Restaurant',
    excerpt: 'Chef Nobu Tanaka brings a revolutionary fusion of Japanese precision and Emirati flavors to Downtown Dubai\'s most anticipated culinary opening.',
    content: '<p>The wait is finally over. <strong>Saffron & Steel</strong>, the highly anticipated restaurant from Chef Nobu Tanaka, has opened its doors on the 72nd floor of the Burj Vista tower, and it was worth every moment of anticipation.</p><p>The restaurant marries the precision of Japanese kaiseki cuisine with the bold, aromatic flavors of traditional Emirati cooking — a combination that sounds improbable on paper but sings on the palate.</p><h2>The Experience</h2><p>From the moment you step out of the private elevator, you\'re transported. The 80-seat dining room is designed to feel like a modern desert oasis, with flowing water features, warm amber lighting, and floor-to-ceiling windows offering panoramic views of the Burj Khalifa.</p><h2>Must-Try Dishes</h2><ul><li><strong>Wagyu Machboos</strong> — A5 wagyu slow-cooked with traditional spice blend</li><li><strong>Sashimi Garden</strong> — Market fish with Arabic microgreens and date vinaigrette</li><li><strong>Gold Mochi</strong> — 24k gold-leaf dessert with saffron ice cream</li></ul>',
    featuredImage: 'https://picsum.photos/seed/restaurant/1200/800',
    tags: ['michelin', 'fine dining', 'japanese', 'emirati'],
    isFeatured: true,
    categoryIndex: 2,
  },
  {
    title: 'Dubai\'s Smart City Initiative Reaches Major Milestone',
    excerpt: 'The emirate announces that 80% of government services are now fully AI-powered, making it the most digitally advanced city in the Middle East.',
    content: '<p>Dubai\'s ambitious <strong>Smart City 2030</strong> initiative has reached a landmark milestone, with officials announcing that 80% of all government services are now fully automated using artificial intelligence.</p><p>The achievement places Dubai firmly at the forefront of global digital governance, surpassing cities like Singapore, Seoul, and Helsinki in the latest Smart City Index rankings.</p><h2>What This Means for Residents</h2><p>For the average Dubai resident, this translates to faster processing times, reduced paperwork, and 24/7 access to services that previously required in-person visits. Visa renewals, business licensing, and even healthcare appointments are now handled through a unified AI platform.</p><p>"We\'re not just digitizing old processes — we\'re reimagining what government service can be," said the Director of Digital Dubai.</p>',
    featuredImage: 'https://picsum.photos/seed/smart-city/1200/800',
    tags: ['smart city', 'AI', 'technology', 'government'],
    isFeatured: false,
    categoryIndex: 0,
  },
  {
    title: 'Weekend Escape: The Best Desert Glamping Experiences',
    excerpt: 'Trade the city skyline for a canopy of stars with these luxury desert camping experiences just a short drive from Dubai.',
    content: '<p>There\'s something magical about the desert at night. Away from the city\'s dazzling lights, the Arabian desert reveals a sky so full of stars it feels almost surreal.</p><p>Over the past few years, a new wave of <strong>luxury glamping</strong> experiences has emerged, offering the perfect blend of adventure and comfort for weekend warriors looking to escape the urban buzz.</p><h2>Top Picks</h2><h3>Starlight Dunes Camp</h3><p>Located 90 minutes from Dubai in the Lahbab desert, this boutique camp features just 12 safari-style tents, each with king-sized beds, private terraces, and outdoor showers. The evening entertainment includes traditional Bedouin storytelling and oud music under the stars.</p><h3>Al Maha Wilderness Reserve</h3><p>For those seeking complete immersion in nature, this eco-reserve offers guided wildlife walks, falconry demonstrations, and sunrise camel treks through pristine dune landscapes.</p>',
    featuredImage: 'https://picsum.photos/seed/glamping/1200/800',
    tags: ['desert', 'glamping', 'weekend', 'outdoor'],
    isFeatured: false,
    categoryIndex: 5,
  },
  {
    title: 'The Rise of Dubai\'s Independent Coffee Scene',
    excerpt: 'Forget chain cafes — a new generation of specialty roasters is transforming how Dubai drinks its coffee, one pour-over at a time.',
    content: '<p>Walk through the streets of Al Quoz or Jumeirah and you\'ll notice something brewing — literally. Dubai\'s <strong>independent coffee scene</strong> has exploded, with over 50 new specialty cafés opening in the past year alone.</p><p>These aren\'t your typical grab-and-go spots. We\'re talking single-origin Ethiopian beans roasted on-site, cold brew aged in oak barrels, and baristas who can explain the terroir of your cup with the same passion as a sommelier.</p><h2>Where to Start</h2><ul><li><strong>Nightjar Coffee</strong> — The OG of Dubai specialty coffee, consistently excellent</li><li><strong>% Arabica</strong> — Minimalist Japanese chain with impeccable standards</li><li><strong>RAW Coffee Company</strong> — Al Quoz pioneers with a cult following</li></ul>',
    featuredImage: 'https://picsum.photos/seed/coffee/1200/800',
    tags: ['coffee', 'cafes', 'al quoz', 'specialty'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Dubai Art Week 2024: Everything You Need to Know',
    excerpt: 'The annual celebration of contemporary art returns with over 200 exhibitions, installations, and performances across the city.',
    content: '<p><strong>Dubai Art Week</strong> is back and bigger than ever. Running from March 15-22, this year\'s edition features over 200 exhibitions, pop-up galleries, street art installations, and live performances scattered across the city.</p><p>From the established galleries of Alserkal Avenue to surprise pop-ups in abandoned warehouses, Dubai Art Week has evolved from a niche cultural event into one of the Middle East\'s most important creative gatherings.</p><h2>Highlights</h2><ul><li><strong>The Mirror Garden</strong> — A massive interactive installation in Zabeel Park using 10,000 reflective panels</li><li><strong>Voices of the Gulf</strong> — Group exhibition featuring 30 emerging Emirati artists</li><li><strong>Night Art Walk</strong> — Self-guided evening tour through D3 with live music and food trucks</li></ul>',
    featuredImage: 'https://picsum.photos/seed/art-week/1200/800',
    tags: ['art', 'exhibitions', 'culture', 'alserkal'],
    isFeatured: true,
    categoryIndex: 4,
  },
  {
    title: 'Sustainable Fashion: Dubai\'s Eco-Friendly Style Revolution',
    excerpt: 'Local designers are leading a green revolution in fashion, proving that sustainability and luxury can go hand in hand.',
    content: '<p>The fashion industry is one of the world\'s biggest polluters, but a growing movement of <strong>Dubai-based designers</strong> is proving that style doesn\'t have to come at the planet\'s expense.</p><p>From upcycled couture to biodegradable activewear, these innovative labels are rewriting the rules of Middle Eastern fashion while staying true to the region\'s love of luxury and craftsmanship.</p><h2>Brands to Watch</h2><h3>Desert Rose Collective</h3><p>Founded by Sheikha Amal, this label creates stunning evening wear from recycled ocean plastics and organic silk. Each piece is handcrafted by artisans in a solar-powered atelier.</p><h3>Thread & Thorn</h3><p>Menswear label specializing in business attire made from sustainable bamboo and hemp fabrics. Their suits are as sharp as any Savile Row offering.</p>',
    featuredImage: 'https://picsum.photos/seed/fashion/1200/800',
    tags: ['fashion', 'sustainability', 'eco-friendly'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'New Metro Extension Connects Dubai\'s Cultural District',
    excerpt: 'The expanded Red Line now reaches the Dubai Design District and Alserkal Avenue, making art and culture more accessible than ever.',
    content: '<p>Commuters and culture enthusiasts rejoice — the <strong>Dubai Metro Red Line extension</strong> is now fully operational, adding four new stations that connect some of the city\'s most vibrant cultural hubs.</p><p>The new stations serve Dubai Design District (D3), Alserkal Avenue, Dubai Creek Harbour, and the upcoming Museum Quarter, dramatically improving accessibility to areas that were previously car-dependent.</p><h2>Station Highlights</h2><p>Each station has been designed by a different architect, turning the commute itself into an art experience. The D3 station features a stunning digital ceiling that displays rotating artworks from local creators.</p>',
    featuredImage: 'https://picsum.photos/seed/metro/1200/800',
    tags: ['metro', 'transport', 'infrastructure'],
    isFeatured: false,
    categoryIndex: 0,
  },
  {
    title: 'Dubai\'s Top 10 Rooftop Bars for 2024',
    excerpt: 'Sip cocktails above the clouds at these stunning elevated venues, each offering unforgettable views and world-class drinks.',
    content: '<p>Dubai\'s skyline was made for rooftop drinking. From the glittering towers of Downtown to the waterfront glamour of JBR, the city\'s <strong>rooftop bar scene</strong> continues to evolve with increasingly creative concepts.</p><p>We\'ve tested them all (tough job, we know) and ranked the definitive top 10 for 2024.</p><h2>The Top 3</h2><h3>1. Horizon Lounge</h3><p>Perched on the 87th floor of the Address Sky View, this intimate space seats just 40 guests and serves a cocktail menu inspired by the seven emirates.</p><h3>2. Jetty Lounge</h3><p>The One&Only Royal Mirage\'s beachside-meets-rooftop concept remains unmatched for sunset vibes and Arabesque-inspired mixology.</p><h3>3. FIVE Palm Sky Bar</h3><p>The party energy here is infectious, with resident DJs, bottle service, and a pool you can swim in while overlooking the Palm.</p>',
    featuredImage: 'https://picsum.photos/seed/rooftop/1200/800',
    tags: ['bars', 'rooftop', 'nightlife', 'cocktails'],
    isFeatured: false,
    categoryIndex: 2,
  },
  {
    title: 'Wellness Retreats: Finding Inner Peace in the UAE',
    excerpt: 'From yoga sanctuaries in the mountains to floating meditation pods, discover the most transformative wellness experiences in the Emirates.',
    content: '<p>In a city known for its fast pace and ambition, the <strong>wellness movement</strong> in Dubai has become a powerful counterbalance — a growing community dedicated to mindfulness, holistic health, and finding balance.</p><p>Whether you\'re a seasoned practitioner or a stressed-out professional looking for a reset, these retreats offer something for everyone.</p><h2>Our Picks</h2><h3>Hatta Serenity Retreat</h3><p>Nestled in the Hajar Mountains, this off-grid retreat combines traditional Ayurvedic practices with modern neuroscience. The signature "digital detox" program is transformative.</p><h3>The Float Lab</h3><p>Located in DIFC, this urban sanctuary features sensory deprivation pods that promise 90 minutes of complete mental reset. It\'s become the secret weapon of Dubai\'s top executives.</p>',
    featuredImage: 'https://picsum.photos/seed/wellness/1200/800',
    tags: ['wellness', 'yoga', 'meditation', 'retreat'],
    isFeatured: false,
    categoryIndex: 3,
  },
  {
    title: 'Exploring the Ancient Souks: A Modern Guide to Traditional Markets',
    excerpt: 'The historic souks of Dubai blend centuries of trading heritage with contemporary culture — here\'s how to experience them like a local.',
    content: '<p>Long before the malls and skyscrapers, there were the <strong>souks</strong> — the beating commercial heart of Dubai. These traditional markets have been drawing traders and travelers for centuries, and today they remain one of the city\'s most authentic and rewarding experiences.</p><h2>The Gold Souk</h2><p>Home to over 300 retailers, the Deira Gold Souk is the world\'s largest gold market. The glittering displays are breathtaking, and prices are often surprisingly competitive thanks to the UAE\'s zero tax on gold.</p><h2>The Spice Souk</h2><p>Just steps away, the aroma of the Spice Souk hits you before you see it. Sacks of saffron, frankincense, dried roses, and exotic blends line the narrow pathways. Vendors are happy to chat and share recipes.</p><h2>Tips for Visiting</h2><ul><li>Visit in the morning for the best selection</li><li>Haggling is expected — start at 50% of the asking price</li><li>Take the abra (water taxi) across Dubai Creek for the full experience</li></ul>',
    featuredImage: 'https://picsum.photos/seed/souks/1200/800',
    tags: ['souks', 'heritage', 'traditional', 'markets'],
    isFeatured: true,
    categoryIndex: 4,
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
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dubaiblooms';
    await mongoose.connect(uri);
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
        email: 'hello@dubaiblooms.com',
        phone: '+971 4 000 0000',
        address: 'Media City, Dubai, UAE',
      },
      socialLinks: {
        facebook: 'https://facebook.com/dubaiblooms',
        twitter: 'https://twitter.com/dubaiblooms',
        instagram: 'https://instagram.com/dubaiblooms',
        linkedin: 'https://linkedin.com/company/dubaiblooms',
      },
      footerText: '© 2024 Dubai Blooms. All rights reserved.',
    });
    console.log('⚙️  Settings created');

    console.log('\n✅ Seed completed successfully!');
    console.log('   Login: admin@dubaiblooms.com / admin123\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
