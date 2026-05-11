import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import styles from './Footer.module.css';
import { useSiteData } from '@/hooks/useSiteData';
import { categoryVisibleInMainMenu } from '@/lib/categoryNav';

const DEFAULT_INSTAGRAM = 'https://www.instagram.com/dubai.blooms?igsh=MXM0bGR4ZGhhZjByNg==';

function isHttpUrl(value: string | undefined | null): value is string {
  if (!value) {
    return false;
  }
  const v = value.trim();
  return v !== '#' && /^https?:\/\//i.test(v);
}

function contactTelHref(phone: string): string | null {
  const compact = phone.replace(/[\s().-]/g, '');
  if (!compact || !/^\+?\d/.test(compact)) {
    return null;
  }
  return `tel:${compact}`;
}

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}

export function Footer() {
  const { settings, categories } = useSiteData();
  const categoriesForNav = useMemo(
    () => categories.filter(categoryVisibleInMainMenu),
    [categories]
  );
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const opener = window.setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => window.clearTimeout(opener);
  }, []);

  useEffect(() => {
    if (!showPopup) {
      return;
    }
    const closer = window.setTimeout(() => setShowPopup(false), 10000);
    return () => window.clearTimeout(closer);
  }, [showPopup]);

  const contactEmail = settings?.contactInfo?.email || 'marketing@dubaiblooms.ae';
  const contactPhone = settings?.contactInfo?.phone || '+971 50 780 3538';
  const contactAddress = settings?.contactInfo?.address || 'Dubai, UAE';
  const phoneHref = contactTelHref(contactPhone);

  const socialLinks = useMemo(() => {
    const ig = settings?.socialLinks?.instagram?.trim() || DEFAULT_INSTAGRAM;
    const entries: { key: string; label: string; abbr: string; href: string }[] = [];
    if (isHttpUrl(ig)) {
      entries.push({ key: 'instagram', label: 'Instagram', abbr: 'IG', href: ig });
    }
    const fb = settings?.socialLinks?.facebook?.trim();
    if (isHttpUrl(fb)) {
      entries.push({ key: 'facebook', label: 'Facebook', abbr: 'FB', href: fb });
    }
    const tw = settings?.socialLinks?.twitter?.trim();
    if (isHttpUrl(tw)) {
      entries.push({ key: 'twitter', label: 'Twitter', abbr: 'X', href: tw });
    }
    const li = settings?.socialLinks?.linkedin?.trim();
    if (isHttpUrl(li)) {
      entries.push({ key: 'linkedin', label: 'LinkedIn', abbr: 'IN', href: li });
    }
    return entries;
  }, [settings?.socialLinks]);

  const siteName = settings?.siteName?.trim() || 'Dubai Blooms';
  const siteNameParts = siteName.split(/\s+/).filter(Boolean);
  const brandFirst = siteNameParts[0] || siteName;
  const brandRest = siteNameParts.slice(1).join(' ');
  const brandMonogram =
    siteNameParts.length >= 2
      ? (siteNameParts[1]![0] || siteNameParts[0]![0] || 'B').toUpperCase()
      : (siteNameParts[0]?.[0] || 'B').toUpperCase();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const responseMessage = await contentApi.subscribeNewsletter(email.trim());
      setMessage(responseMessage || 'Subscribed successfully.');
      setEmail('');
    } catch {
      setMessage('Unable to subscribe at the moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className={styles.footer}>
      {showPopup ? (
        <div className={styles.subscribePopup} role="dialog" aria-label="Subscribe popup">
          <button className={styles.popupClose} type="button" onClick={() => setShowPopup(false)} aria-label="Close popup">
            ×
          </button>
          <div className={styles.popupBrand}>
            <span className={styles.popupBrandMonogram} aria-hidden>
              {brandMonogram}
            </span>
            <div className={styles.popupBrandWords}>
              <span className={styles.popupBrandPrimary}>{brandFirst}</span>
              {brandRest ? <span className={styles.popupBrandAccent}> {brandRest}</span> : null}
            </div>
          </div>
          <p className={styles.popupKicker}>{settings?.notifications?.title || 'Editor Alert'}</p>
          <h3 className={styles.popupHeadline}>
            {settings?.notifications?.message || 'Get premium Dubai stories first.'}
          </h3>
          <p className={styles.popupSubtext}>Subscribe to receive curated updates and exclusive editorial picks.</p>
          <div className={styles.popupActions}>
            <button
              type="button"
              onClick={() => {
                setShowPopup(false);
                document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Subscribe Now
            </button>
            <button className={styles.popupDismiss} type="button" onClick={() => setShowPopup(false)}>
              Maybe later
            </button>
          </div>
        </div>
      ) : null}

      <section id="newsletter" className={styles.newsletter}>
        <div>
          <p className={styles.kicker}>Newsletter</p>
          <h2>Receive curated stories with a luxury editorial perspective.</h2>
          {message ? <p className={styles.subscribeMessage}>{message}</p> : null}
        </div>
        <form className={styles.form} onSubmit={onSubmit}>
          <label htmlFor="newsletter-email" className={styles.hidden}>
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Joining...' : 'Join'}
          </button>
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
            <li>
              <Link to="/">Home</Link>
            </li>
            {categoriesForNav.slice(0, 4).map((category) => (
              <li key={category._id}>
                <Link to={`/category/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </li>
            <li>
              {phoneHref ? <a href={phoneHref}>{contactPhone}</a> : contactPhone}
            </li>
            <li>
              <a href={mapsSearchUrl(contactAddress)} target="_blank" rel="noopener noreferrer">
                {contactAddress}
              </a>
            </li>
          </ul>
          {socialLinks.length > 0 ? (
            <div className={styles.socials}>
              {socialLinks.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  {s.abbr}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <p className={styles.legal}>{settings?.footerText || 'Copyright Dubai Blooms. All rights reserved.'}</p>
    </footer>
  );
}
