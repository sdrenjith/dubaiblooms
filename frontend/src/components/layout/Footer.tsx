import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '@/lib/api';
import styles from './Footer.module.css';
import { useSiteData } from '@/hooks/useSiteData';
import { categoryVisibleInMainMenu } from '@/lib/categoryNav';
import { resolveMediaSrc } from '@/lib/mediaUrl';

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

function SocialIcon({ name }: { name: string }) {
  const iconProps = {
    className: styles.socialIcon,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
    fill: 'currentColor',
  };

  switch (name) {
    case 'instagram':
      return (
        <svg {...iconProps}>
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11.25 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...iconProps}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg {...iconProps}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...iconProps}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a-2.063 2.063 0 1 1 0-4.127 2.063 2.063 0 0 1 0 4.127zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    default:
      return null;
  }
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
    const entries: { key: string; label: string; href: string }[] = [];
    if (isHttpUrl(ig)) {
      entries.push({ key: 'instagram', label: 'Instagram', href: ig });
    }
    const fb = settings?.socialLinks?.facebook?.trim();
    if (isHttpUrl(fb)) {
      entries.push({ key: 'facebook', label: 'Facebook', href: fb });
    }
    const tw = settings?.socialLinks?.twitter?.trim();
    if (isHttpUrl(tw)) {
      entries.push({ key: 'twitter', label: 'X', href: tw });
    }
    const li = settings?.socialLinks?.linkedin?.trim();
    if (isHttpUrl(li)) {
      entries.push({ key: 'linkedin', label: 'LinkedIn', href: li });
    }
    return entries;
  }, [settings?.socialLinks]);

  const siteName = settings?.siteName?.trim() || 'Dubai Blooms';
  const logoSrc = resolveMediaSrc(settings?.logo);
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
            {logoSrc ? (
              <img className={styles.popupBrandLogo} src={logoSrc} alt={siteName} width={280} height={46} />
            ) : (
              <>
                <span className={styles.popupBrandMonogram} aria-hidden>
                  {brandMonogram}
                </span>
                <div className={styles.popupBrandWords}>
                  <span className={styles.popupBrandPrimary}>{brandFirst}</span>
                  {brandRest ? <span className={styles.popupBrandAccent}> {brandRest}</span> : null}
                </div>
              </>
            )}
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
          {logoSrc ? (
            <div className={styles.footerBrandMark}>
              <img className={styles.footerLogoImg} src={logoSrc} alt={siteName} width={200} height={40} />
            </div>
          ) : (
            <h3>{siteName}</h3>
          )}
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
                <Link to={`/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
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
                  <SocialIcon name={s.key} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <p className={styles.legal}>
        <span>{settings?.footerText || 'Copyright Dubai Blooms. All rights reserved.'}</span>
        <span className={styles.legalSep} aria-hidden="true">
          ·
        </span>
        <Link to="/privacy-policy" className={styles.legalLink}>
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}
