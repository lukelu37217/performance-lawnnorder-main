import React from 'react';
import { CloudSun, Sun, Cloud, CloudRain, Snowflake, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeatherWidgetProps {
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '' }) => {
  // Mock weather data - in a real app this would come from an API
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const getSeasonIcon = () => {
    const season = getCurrentSeason();
    switch (season) {
      case 'Spring': return <Leaf className="w-4 h-4 text-accent" />;
      case 'Summer': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Fall': return <CloudSun className="w-4 h-4 text-orange-500" />;
      case 'Winter': return <Snowflake className="w-4 h-4 text-blue-400" />;
      default: return <CloudSun className="w-4 h-4" />;
    }
  };

  const getWorkingConditions = () => {
    const season = getCurrentSeason();
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour <= 18) {
      return season === 'Summer' ? 'Perfect for outdoor work' : 'Good working conditions';
    }
    return 'Evening - Limited outdoor work';
  };

  return (
    <Card className={`glass-card border-0 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSeasonIcon()}
            <div>
              <p className="text-sm font-medium text-foreground">{getCurrentSeason()} Season</p>
              <p className="text-xs text-muted-foreground">{getWorkingConditions()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;