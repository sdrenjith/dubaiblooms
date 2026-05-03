import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiInstagram, FiMail } from 'react-icons/fi';
import { FaFacebookF, FaXTwitter, FaLinkedinIn, FaPinterestP } from 'react-icons/fa6';
import Container from '@/components/common/Container';

const categories = [
  { label: 'News', path: '/category/news' },
  { label: 'Things To Do', path: '/category/things-to-do' },
  { label: 'Food & Drink', path: '/category/food-drink' },
  { label: 'Lifestyle', path: '/category/lifestyle' },
  { label: 'Culture', path: '/category/culture' },
  { label: 'Travel', path: '/category/travel' },
];

const companyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Advertise', href: '#' },
  { label: 'Press Kit', href: '#' },
  { label: 'Contact', href: '#' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Cookie Policy', href: '#' },
];

const socials = [
  { icon: FiInstagram, label: 'Instagram', href: '#' },
  { icon: FaXTwitter, label: 'X / Twitter', href: '#' },
  { icon: FaFacebookF, label: 'Facebook', href: '#' },
  { icon: FaPinterestP, label: 'Pinterest', href: '#' },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: '#' },
];

const Footer = () => {
  return (
    <footer className="relative mt-14 sm:mt-18 lg:mt-24 overflow-hidden bg-[#0d0d0b] text-white border-t border-[#d4af37]/15">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 38%), linear-gradient(180deg, rgba(212,175,55,0.08) 0%, rgba(13,13,11,0) 42%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[8%] h-[280px] w-[640px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,216,112,0.22) 0%, rgba(201,168,76,0.09) 36%, transparent 72%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-2/3 opacity-40"
        style={{ background: 'linear-gradient(125deg, transparent 0%, rgba(255,255,255,0.05) 42%, transparent 43%, transparent 58%, rgba(212,175,55,0.08) 59%, transparent 72%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)] gap-12 lg:gap-20">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 bg-[#171717] flex items-center justify-center border border-[#d4af37]/25">
                <span className="text-[#d4af37] font-heading font-bold text-xl italic">B</span>
              </div>
              <span className="font-heading text-[26px] font-extrabold tracking-[-0.045em] text-white/90">
                Dubai <span className="italic text-[#d4af37]">Blooms</span>
              </span>
            </Link>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/52">
              A curated guide to Dubai's culture, dining, travel, lifestyle, and city experiences.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 border border-[#d4af37]/20 bg-[#d4af37]/[0.06] px-5 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              <span className="font-accent text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                Est. 2024 | Dubai, UAE
              </span>
            </div>
          </div>

          <div className="border border-white/[0.08] bg-white/[0.035] p-7 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-[#d4af37]/15 flex items-center justify-center border border-[#d4af37]/25 shrink-0">
                <FiMail size={17} className="text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-heading text-[20px] font-extrabold tracking-[-0.035em] !text-white/90">
                  Weekly Newsletter
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/48">
                  Receive curated stories and guides from Dubai Blooms.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="your@email.com"
                className="min-h-12 min-w-0 flex-1 px-5 py-3.5 bg-white/[0.07] border border-white/[0.1]
                  text-[14px] text-white placeholder-white/25 outline-none
                  focus:border-[#d4af37]/60 focus:bg-white/[0.1] transition-all duration-300"
              />
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[11px] font-accent font-extrabold 
                  uppercase tracking-[0.14em] bg-gradient-to-r from-[#b8942e] via-[#d4af37] to-[#c9a84c] 
                  text-[#14120d] shadow-[0_10px_26px_rgba(212,175,55,0.18)] hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(212,175,55,0.34)] 
                  active:translate-y-0 transition-all duration-300 cursor-pointer whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 border-t border-white/[0.08] pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="font-accent text-[10px] font-bold uppercase tracking-[0.25em] !text-white/38 mb-6">
              Explore
            </h4>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat.path}>
                  <Link
                    to={cat.path}
                    className="group inline-flex items-center gap-2 text-white/58 text-[14px] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    <FiArrowUpRight
                      size={12}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0"
                    />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-accent text-[10px] font-bold uppercase tracking-[0.25em] !text-white/38 mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-white/58 text-[14px] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-accent text-[10px] font-bold uppercase tracking-[0.25em] !text-white/38 mb-6">
              Contact
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:hello@dubaiblooms.com"
                className="flex items-center gap-2 text-[14px] text-white/50 hover:text-[#d4af37] transition-colors duration-300 group"
              >
                <span className="w-1 h-1 rounded-full bg-[#b8942e]/60 group-hover:bg-[#d4af37] transition-colors" />
                hello@dubaiblooms.com
              </a>
              <p className="flex items-center gap-2 text-[14px] text-white/50">
                <span className="w-1 h-1 rounded-full bg-[#b8942e]/60" />
                +971 4 000 0000
              </p>
              <p className="flex items-center gap-2 text-[14px] text-white/50">
                <span className="w-1 h-1 rounded-full bg-[#b8942e]/60" />
                Media City, Dubai, UAE
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-accent text-[10px] font-bold uppercase tracking-[0.25em] !text-white/38 mb-6">
              Follow
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 border border-white/[0.1] bg-white/[0.035] flex items-center justify-center
                    text-white/38 hover:text-[#14120d] hover:bg-[#d4af37] hover:border-[#d4af37]
                    transition-all duration-300 cursor-pointer"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.08] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-white/24 text-[12px] font-accent tracking-widest uppercase">
            © {new Date().getFullYear()} Dubai Blooms Media. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {legalLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-white/32 text-[12px] font-accent tracking-wider uppercase hover:text-[#d4af37] transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
