import { FaFacebookF, FaXTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';
import { FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  url: string;
  title: string;
  vertical?: boolean;
}

const ShareButtons = ({ url, title, vertical = false }: ShareButtonsProps) => {
  const fullUrl = `https://dubaiblooms.com${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied!');
  };

  const buttons = [
    { icon: FaFacebookF, href: `https://facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: 'Facebook' },
    { icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, label: 'X' },
    { icon: FaLinkedinIn, href: `https://linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`, label: 'LinkedIn' },
    { icon: FaWhatsapp, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, label: 'WhatsApp' },
  ];

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-2.5`}>
      {buttons.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className="w-10 h-10 rounded-full flex items-center justify-center
            bg-surface-elevated border border-border text-text-muted
            hover:text-primary hover:border-primary/25 hover:bg-primary/5
            transition-all duration-300"
        >
          <Icon size={13} />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="w-10 h-10 rounded-full flex items-center justify-center
          bg-surface-elevated border border-border text-text-muted
          hover:text-primary hover:border-primary/25 hover:bg-primary/5
          transition-all duration-300 cursor-pointer"
      >
        <FiLink size={13} />
      </button>
    </div>
  );
};

export default ShareButtons;
