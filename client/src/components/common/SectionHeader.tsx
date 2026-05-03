import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  label?: string;
  className?: string;
  align?: 'left' | 'center';
}

const SectionHeader = ({ 
  title, 
  subtitle, 
  label = 'Featured', 
  className = '',
  align = 'left' 
}: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-8 sm:mb-10 md:mb-12 lg:mb-14 ${align === 'center' ? 'text-center flex flex-col items-center' : ''} ${className}`}
    >
      <div className={`flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 ${align === 'center' ? 'justify-center' : ''}`}>
        <div className="w-10 sm:w-14 h-[2px] bg-gradient-to-r from-[#b8942e] to-[#d4af37] rounded-full" />
        <span className="font-accent text-[11px] font-bold tracking-[0.2em] uppercase text-[#b8942e]">
          {label}
        </span>
      </div>
      
      <h2 className={`font-heading font-extrabold text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.045em] text-[#1a1a1a] leading-[1.08] mb-3 ${align === 'center' ? 'max-w-3xl' : ''}`}>
        {title}
      </h2>
      
      {subtitle && (
        <p className={`text-[#888] text-[15px] sm:text-[16px] leading-relaxed max-w-lg ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
