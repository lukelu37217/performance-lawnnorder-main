import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarContent, useSidebar, Sidebar } from '@/components/ui/sidebar';
import { BarChart3, Users, UserCheck, TrendingUp, FileText, BookOpen, Bell, Settings, Shield, Clock, Home, TreePine, Shovel, Hammer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CompanyLogo from './CompanyLogo';
import { cn } from '@/lib/utils';

// Navigation items with landscaping-themed icons
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
  { id: 'users', title: 'User Management', icon: Shield },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === "collapsed";

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
  };

  const getNavClassName = (tab: string) => {
    const isActive = activeTab === tab;
    return cn(
      "group transition-all duration-normal hover:bg-accent/10 rounded-xl",
      isActive 
        ? "bg-gradient-primary text-primary-foreground shadow-glow" 
        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
    );
  };

  return (
    <Sidebar 
      className={cn(
        "transition-all duration-300 ease-in-out border-r-0 shadow-lg",
        collapsed ? "w-16" : "w-72"
      )}
      collapsible="icon"
    >
      <SidebarContent className="glass-card bg-gradient-card backdrop-blur-md border-0">
        {/* Header with Lawn 'N' Order branding */}
        <div className={cn(
          "p-6 border-b border-white/10",
          collapsed && "p-4"
        )}>
          {!collapsed ? (
            <CompanyLogo size="md" />
          ) : (
            <div className="flex justify-center">
              <CompanyLogo size="sm" showText={false} />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={cn(
            "text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3 transition-all duration-normal",
            collapsed ? 'sr-only' : 'block'
          )}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainNavItems.map((item, index) => (
                <SidebarMenuItem key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <SidebarMenuButton 
                    asChild
                    className={getNavClassName(item.id)}
                  >
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-normal hover:shadow-sm hover:-translate-y-0.5"
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-normal group-hover:scale-110",
                        activeTab === item.id 
                          ? "bg-white/20 shadow-glow" 
                          : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        <item.icon className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors duration-normal",
                          activeTab === item.id 
                            ? "text-primary-foreground" 
                            : "text-foreground"
                        )} />
                      </div>
                      {!collapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Utility Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={cn(
            "text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3 transition-all duration-normal",
            collapsed ? 'sr-only' : 'block'
          )}>
            Tools & Equipment
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {utilityNavItems.map((item, index) => (
                <SidebarMenuItem key={item.id} className="animate-fade-in" style={{ animationDelay: `${(index + mainNavItems.length) * 50}ms` }}>
                  <SidebarMenuButton 
                    asChild
                    className={getNavClassName(item.id)}
                  >
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-normal hover:shadow-sm hover:-translate-y-0.5"
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-normal group-hover:scale-110",
                        activeTab === item.id 
                          ? "bg-white/20 shadow-glow" 
                          : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        <item.icon className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors duration-normal",
                          activeTab === item.id 
                            ? "text-primary-foreground" 
                            : "text-foreground"
                        )} />
                      </div>
                      {!collapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admin users */}
        {user?.role === 'admin' && (
          <SidebarGroup className="px-3 py-4">
            <SidebarGroupLabel className={cn(
              "text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3 transition-all duration-normal",
              collapsed ? 'sr-only' : 'block'
            )}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {adminNavItems.map((item, index) => (
                  <SidebarMenuItem key={item.id} className="animate-fade-in" style={{ animationDelay: `${(index + mainNavItems.length + utilityNavItems.length) * 50}ms` }}>
                    <SidebarMenuButton 
                      asChild
                      className={getNavClassName(item.id)}
                    >
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-normal hover:shadow-sm hover:-translate-y-0.5"
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-all duration-normal group-hover:scale-110",
                          activeTab === item.id 
                            ? "bg-white/20 shadow-glow" 
                            : "bg-white/5 group-hover:bg-white/10"
                        )}>
                          <item.icon className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors duration-normal",
                            activeTab === item.id 
                              ? "text-primary-foreground" 
                              : "text-foreground"
                          )} />
                        </div>
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}