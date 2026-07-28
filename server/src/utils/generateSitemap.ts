import Article from '../models/Article.js';
import Category from '../models/Category.js';

export const generateSitemap = async (baseUrl: string): Promise<string> => {
  const articles = await Article.find({ isPublished: true }).populate('category').select('slug category updatedAt');
  const categories = await Category.find().select('slug updatedAt');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Legal
  xml += `  <url>\n    <loc>${baseUrl}/privacy-policy</loc>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;

  // Category pages
  for (const cat of categories) {
    xml += `  <url>\n    <loc>${baseUrl}/${cat.slug}</loc>\n    <lastmod>${cat.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Article pages
  for (const article of articles) {
    const cat = article.category as any;
    const categorySlug = cat?.slug || 'uncategorized';
    xml += `  <url>\n    <loc>${baseUrl}/${categorySlug}/${article.slug}</loc>\n    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  xml += '</urlset>';
  return xml;
};
