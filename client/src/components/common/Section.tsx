import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
}

const Section = ({ 
  children, 
  className = '', 
  id, 
  spacing = 'lg' 
}: SectionProps) => {
  const spacingClasses = {
    sm: 'py-10 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-14 md:py-16 lg:py-20',
    xl: 'py-16 md:py-20 lg:py-24',
    none: ''
  };

  return (
    <section 
      id={id}
      className={`${spacingClasses[spacing]} ${className}`}
    >
      {children}
    </section>
  );
};

export default Section;
