import React from 'react';

interface CompanyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };
  
  const subtitleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizes[size]} font-bold text-foreground leading-tight tracking-tight`}>
            Lawn 'N' Order
          </h1>
          <p className={`${subtitleSizes[size]} text-muted-foreground font-medium tracking-wide`}>
            Custom Landscapes
          </p>
        </div>
      )}
    </div>
  );
};
export default CompanyLogo;