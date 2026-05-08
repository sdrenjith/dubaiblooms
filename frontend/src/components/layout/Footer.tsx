import styles from './Footer.module.css';
import { useSiteData } from '@/hooks/useSiteData';

export function Footer() {
  const { settings, categories } = useSiteData();

  return (
    <footer className={styles.footer}>
      <section className={styles.newsletter}>
        <div>
          <p className={styles.kicker}>Newsletter</p>
          <h2>Receive curated stories with a luxury editorial perspective.</h2>
        </div>
        <form className={styles.form}>
          <label htmlFor="newsletter-email" className={styles.hidden}>
            Email
          </label>
          <input id="newsletter-email" type="email" placeholder="you@example.com" />
          <button type="submit">Join</button>
        </form>
      </section>

      <section className={styles.grid}>
        <div>
          <h3>{settings?.siteName || 'Dubai Blooms'}</h3>
          <p>{settings?.tagline || 'A modern luxury publication across travel, design, and lifestyle.'}</p>
        </div>

        <div>
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Home</a></li>
            {categories.slice(0, 4).map((category) => (
              <li key={category._id}>
                <a href={`/category/${category.slug}`}>{category.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Advertise</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>{settings?.contactInfo?.email || 'editor@dubaiblooms.com'}</li>
            <li>{settings?.contactInfo?.phone || '+971 00 000 0000'}</li>
            <li>{settings?.contactInfo?.address || 'Dubai, UAE'}</li>
          </ul>
          <div className={styles.socials}>
            <a href={settings?.socialLinks?.instagram || '#'} aria-label="Instagram">IG</a>
            <a href={settings?.socialLinks?.facebook || '#'} aria-label="Facebook">FB</a>
            <a href={settings?.socialLinks?.twitter || '#'} aria-label="Twitter">X</a>
            <a href={settings?.socialLinks?.linkedin || '#'} aria-label="LinkedIn">IN</a>
          </div>
        </div>
      </section>

      <p className={styles.legal}>{settings?.footerText || 'Copyright Dubai Blooms. All rights reserved.'}</p>
    </footer>
  );
}
