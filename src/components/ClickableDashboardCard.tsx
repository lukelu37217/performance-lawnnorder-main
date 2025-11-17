
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClickableDashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  iconColor?: string;
}

const ClickableDashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  onClick, 
  className,
  iconColor = "text-primary"
}: ClickableDashboardCardProps) => {
  return (
    <Card 
      className={cn(
        "group transition-all duration-200 ease-out hover:shadow-lg",
        onClick && "cursor-pointer hover:-translate-y-1 active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl transition-all duration-200 ease-out group-hover:bg-primary/15">
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickableDashboardCard;
