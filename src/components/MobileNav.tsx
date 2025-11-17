import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, Home, UserCheck, Users, Shovel, FileText, BarChart3, BookOpen, Bell, UserCog, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  // For now, assume admin if user exists - adjust based on your auth logic
  const isAdmin = !!user;

  const mainNavItems = [
    { id: 'dashboard', title: 'Dashboard', icon: Home },
    { id: 'evaluation', title: 'Evaluation', icon: UserCheck },
    { id: 'workers', title: 'Workers', icon: Users },
    { id: 'foremen', title: 'Foremen', icon: Shovel },
    { id: 'history', title: 'History', icon: FileText },
    { id: 'reports', title: 'Reports', icon: BarChart3 },
  ];

  const utilityNavItems = [
    { id: 'guide', title: 'Scoring Guide', icon: BookOpen },
    { id: 'reminders', title: 'Reminders', icon: Bell },
  ];

  const adminNavItems = [
    { id: 'users', title: 'User Management', icon: UserCog },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Navigation</SheetTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full px-3">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground px-3 mb-2">Main</h4>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-left font-medium transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Utilities */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground px-3 mb-2">Utilities</h4>
            {utilityNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-left font-medium transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Button>
              );
            })}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-3 mb-2">Administration</h4>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-12 text-left font-medium transition-all",
                        isActive && "bg-primary text-primary-foreground shadow-sm"
                      )}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </Button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex-1" />
          
          {/* Footer */}
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Lawn 'N' Order Performance
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;