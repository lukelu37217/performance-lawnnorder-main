
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Calendar, Clock, Users, Settings, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reminderService, ReminderConfig } from '@/services/reminderService';
import { useToast } from '@/hooks/use-toast';

const ReminderSystem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canManageReminders, setCanManageReminders] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [editingNotifications, setEditingNotifications] = useState(false);
  const [currentPeriodStart, setCurrentPeriodStart] = useState('');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState('');
  const [config, setConfig] = useState<ReminderConfig>({
    evaluationDeadlineDays: 14,
    reminderDaysBefore: 3,
    emailEnabled: true,
    inAppEnabled: true,
    reminderTitle: 'Biweekly Evaluation Reminder',
    reminderMessage: 'Your biweekly evaluations are due soon. Please complete all pending evaluations before the deadline.',
    escalationEnabled: false,
    escalationDays: 1,
    isActive: true
  });

  useEffect(() => {
    loadReminderConfig();
  }, []);

  useEffect(() => {
    if (user?.id) {
      checkPermissions();
    }
  }, [user?.id]);

  useEffect(() => {
    const periodInfo = getCurrentPeriodInfo();
    setCurrentPeriodStart(periodInfo.periodStart.toISOString().split('T')[0]);
    setCurrentPeriodEnd(periodInfo.periodEnd.toISOString().split('T')[0]);
  }, [config.evaluationDeadlineDays]);

  const checkPermissions = async () => {
    if (!user?.id) return;
    
    try {
      const canManage = await reminderService.checkCanManageReminders(user.id);
      setCanManageReminders(canManage);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setCanManageReminders(false);
    }
  };

  const loadReminderConfig = async () => {
    try {
      setLoading(true);
      const reminderConfig = await reminderService.getReminderConfig();
      
      if (reminderConfig) {
        setConfig(reminderConfig);
      }
    } catch (error) {
      console.error('Error loading reminder config:', error);
      toast({
        title: "Error",
        description: "Failed to load reminder configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!canManageReminders || !user?.id) {
      toast({
        title: "Access Denied",
        description: "Only leaders and admins can modify reminder settings.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      await reminderService.updateReminderConfig(config, user.id);
      toast({
        title: "Settings Saved",
        description: "Reminder configuration has been updated successfully."
      });
    } catch (error) {
      console.error('Error saving reminder config:', error);
      toast({
        title: "Error",
        description: "Failed to save reminder configuration.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentPeriodInfo = () => {
    const now = new Date();
    const biweeklyPeriod = Math.ceil(now.getTime() / (1000 * 60 * 60 * 24 * config.evaluationDeadlineDays));
    const periodStart = new Date(biweeklyPeriod * config.evaluationDeadlineDays * 24 * 60 * 60 * 1000 - (config.evaluationDeadlineDays * 24 * 60 * 60 * 1000));
    const periodEnd = new Date(biweeklyPeriod * config.evaluationDeadlineDays * 24 * 60 * 60 * 1000);
    const daysUntilDeadline = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      biweeklyPeriod,
      periodStart,
      periodEnd,
      daysUntilDeadline,
      isReminderTime: daysUntilDeadline <= config.reminderDaysBefore && daysUntilDeadline > 0,
      isOverdue: daysUntilDeadline < 0
    };
  };

  const handleConfigureReminders = () => {
    navigate('/?tab=reminder-config');
  };

  const handlePeriodSave = () => {
    // Calculate new evaluation deadline days based on period dates
    const start = new Date(currentPeriodStart);
    const end = new Date(currentPeriodEnd);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    setConfig(prev => ({ ...prev, evaluationDeadlineDays: daysDiff }));
    setEditingPeriod(false);
    toast({
      title: "Period Updated",
      description: "Current evaluation period has been updated."
    });
  };

  const handleScheduleSave = () => {
    setEditingSchedule(false);
    saveConfig();
  };

  const handleNotificationsSave = () => {
    setEditingNotifications(false);
    saveConfig();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading reminder system...</p>
      </div>
    );
  }

  if (!config.isActive) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Reminder system is currently disabled</p>
            {canManageReminders && (
              <Button 
                variant="outline" 
                onClick={handleConfigureReminders}
                className="mt-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Reminders
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const periodInfo = getCurrentPeriodInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluation Reminders</h1>
          <p className="text-gray-600">Stay on track with biweekly performance evaluations</p>
        </div>
        {canManageReminders && (
          <Button 
            variant="outline" 
            onClick={handleConfigureReminders}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        )}
      </div>

      {/* Current Period Status */}
      <Card className={`border-2 ${
        periodInfo.isOverdue ? 'border-red-200 bg-red-50' : 
        periodInfo.isReminderTime ? 'border-amber-200 bg-amber-50' : 
        'border-green-200 bg-green-50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Evaluation Period
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={
                periodInfo.isOverdue ? 'destructive' : 
                periodInfo.isReminderTime ? 'destructive' : 
                'default'
              }>
                {periodInfo.isOverdue ? 'OVERDUE' : 
                 periodInfo.isReminderTime ? 'DUE SOON' : 
                 'ON TRACK'}
              </Badge>
              {canManageReminders && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditingPeriod(!editingPeriod)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingPeriod ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period-start">Period Start</Label>
                  <Input
                    id="period-start"
                    type="date"
                    value={currentPeriodStart}
                    onChange={(e) => setCurrentPeriodStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="period-end">Period End</Label>
                  <Input
                    id="period-end"
                    type="date"
                    value={currentPeriodEnd}
                    onChange={(e) => setCurrentPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handlePeriodSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingPeriod(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Period Start</p>
                <p className="font-semibold">{periodInfo.periodStart.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-semibold">{periodInfo.periodEnd.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className={`font-semibold ${
                  periodInfo.isOverdue ? 'text-red-600' : 
                  periodInfo.isReminderTime ? 'text-amber-600' : 
                  'text-green-600'
                }`}>
                  {periodInfo.daysUntilDeadline < 0 ? 
                    `${Math.abs(periodInfo.daysUntilDeadline)} days overdue` : 
                    `${periodInfo.daysUntilDeadline} days left`
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Reminder */}
      {config.inAppEnabled && (periodInfo.isReminderTime || periodInfo.isOverdue) && (
        <Card className={`border-2 ${
          periodInfo.isOverdue ? 'border-red-500' : 'border-amber-500'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${
                periodInfo.isOverdue ? 'text-red-600' : 'text-amber-600'
              }`} />
              {config.reminderTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{config.reminderMessage}</p>
            <Button 
              onClick={() => navigate('/?tab=evaluation')}
              className={periodInfo.isOverdue ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Complete Evaluations Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule Settings
              </span>
              {canManageReminders && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditingSchedule(!editingSchedule)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {editingSchedule ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deadline-days">Evaluation Cycle (Days)</Label>
                  <Input
                    id="deadline-days"
                    type="number"
                    min="7"
                    max="30"
                    value={config.evaluationDeadlineDays}
                    onChange={(e) => setConfig(prev => ({ ...prev, evaluationDeadlineDays: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reminder-days">Reminder Days Before</Label>
                  <Input
                    id="reminder-days"
                    type="number"
                    min="1"
                    max="7"
                    value={config.reminderDaysBefore}
                    onChange={(e) => setConfig(prev => ({ ...prev, reminderDaysBefore: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Escalation Enabled</Label>
                  <Switch
                    checked={config.escalationEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, escalationEnabled: checked }))}
                  />
                </div>
                {config.escalationEnabled && (
                  <div>
                    <Label htmlFor="escalation-days">Escalation Days</Label>
                    <Input
                      id="escalation-days"
                      type="number"
                      min="1"
                      max="7"
                      value={config.escalationDays}
                      onChange={(e) => setConfig(prev => ({ ...prev, escalationDays: parseInt(e.target.value) }))}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleScheduleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingSchedule(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Evaluation Cycle:</span>
                  <span className="font-semibold">Every {config.evaluationDeadlineDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Reminder Timing:</span>
                  <span className="font-semibold">{config.reminderDaysBefore} days before</span>
                </div>
                <div className="flex justify-between">
                  <span>Escalation:</span>
                  <span className="font-semibold">
                    {config.escalationEnabled ? `After ${config.escalationDays} days` : 'Disabled'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Notification Status
              </span>
              {canManageReminders && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditingNotifications(!editingNotifications)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {editingNotifications ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Reminders</Label>
                  <Switch
                    checked={config.emailEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>In-App Reminders</Label>
                  <Switch
                    checked={config.inAppEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, inAppEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>System Active</Label>
                  <Switch
                    checked={config.isActive}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleNotificationsSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingNotifications(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span>Email Reminders:</span>
                  <Badge variant={config.emailEnabled ? 'default' : 'secondary'}>
                    {config.emailEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>In-App Reminders:</span>
                  <Badge variant={config.inAppEnabled ? 'default' : 'secondary'}>
                    {config.inAppEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>System Status:</span>
                  <Badge variant={config.isActive ? 'default' : 'destructive'}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReminderSystem;
