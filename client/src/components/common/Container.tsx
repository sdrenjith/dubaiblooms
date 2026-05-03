import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  clean?: boolean;
}

const Container = ({ children, className = '', clean = false }: ContainerProps) => {
  return (
    <div 
      className={`${clean ? 'max-w-[1440px] mx-auto' : 'container-custom'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
