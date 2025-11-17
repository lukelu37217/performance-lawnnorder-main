import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, CloudSun, Calendar } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import CompanyLogo from '@/components/CompanyLogo';
import WorkerManagement from '@/components/WorkerManagement';
import ForemanManagement from '@/components/ForemanManagement';
import EvaluationForm from '@/components/EvaluationForm';
import Dashboard from '@/components/Dashboard';
import ReportsSection from '@/components/ReportsSection';
import EvaluationHistory from '@/components/EvaluationHistory';
import ScoringGuide from '@/components/ScoringGuide';
import ReminderSystem from '@/components/ReminderSystem';
import UserManagement from '@/components/UserManagement';
import MobileNav from '@/components/MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  // Update activeTab when URL parameters change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }

  }, [searchParams]);

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'evaluation':
        return <EvaluationForm />;
      case 'workers':
        return <WorkerManagement />;
      case 'foremen':
        return <ForemanManagement />;
      case 'history':
        return <EvaluationHistory />;
      case 'reports':
        return <ReportsSection />;
      case 'guide':
        return <ScoringGuide />;
      case 'reminders':
        return <ReminderSystem />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Performance Dashboard';
      case 'evaluation': return 'Crew Performance Evaluation';
      case 'workers': return 'Worker Management';
      case 'foremen': return 'Foreman Management';
      case 'history': return 'Evaluation History';
      case 'reports': return 'Performance Reports';
      case 'guide': return 'Performance Scoring Guide';
      case 'reminders': return 'Evaluation Reminders';
      case 'users': return 'User Management';
      default: return 'Performance Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'dashboard': return 'Custom Landscapes Performance Management • Professional landscaping crew analytics and performance tracking';
      case 'evaluation': return 'Comprehensive crew performance evaluation • Safety, quality, efficiency, and teamwork assessment';
      case 'workers': return 'Manage workers and track their performance metrics';
      case 'foremen': return 'Oversee foremen and their crew assignments';
      case 'history': return 'Review evaluation history and track performance improvements';
      case 'reports': return 'Generate comprehensive performance reports for stakeholders';
      case 'guide': return 'Performance evaluation criteria and best practices guide';
      case 'reminders': return 'Stay on schedule with automated evaluation reminders';
      
      case 'users': return 'Manage system access and user permissions';
      default: return 'Track and analyze your landscaping crew\'s biweekly performance metrics';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-bg">
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        
        {/* Desktop Sidebar */}
        {!isMobile && (
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        
        <main className={`flex-1 overflow-auto ${isMobile ? 'pl-0' : 'pl-0'}`}>
          <div className={`${isMobile ? 'p-4 pt-16' : 'p-6'} max-w-7xl mx-auto space-y-6`}>
            {/* Enhanced Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {!isMobile && <SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
                    <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
                      {getPageTitle()}
                    </h1>
                  </div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>
                    {getPageDescription()}
                  </p>
                </div>
                
                {!isMobile && (
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">
                        Welcome, {user?.name} ({user?.role})
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                )}
                
                {isMobile && (
                  <div className="w-full flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Content Container */}
            <div className="animate-fade-in-up">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
