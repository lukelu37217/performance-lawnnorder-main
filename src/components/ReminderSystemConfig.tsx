
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Clock, Mail, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { reminderService, ReminderConfig } from '@/services/reminderService';

const ReminderSystemConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canManageReminders, setCanManageReminders] = useState(false);
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

  const saveReminderConfig = async () => {
    if (!canManageReminders) {
      toast({
        title: "Access Denied",
        description: "Only leaders and admins can modify reminder settings.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated.",
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

  const updateConfig = (field: keyof ReminderConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading reminder settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminder System Configuration</h1>
          <p className="text-gray-600">Configure evaluation deadlines and reminder settings</p>
        </div>
        <Badge variant={canManageReminders ? "default" : "secondary"}>
          {user?.role?.toUpperCase()}
        </Badge>
      </div>

      {!canManageReminders && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <Settings className="w-5 h-5" />
              <span className="font-medium">View Only Access</span>
            </div>
            <p className="text-amber-700 mt-2">
              Only leaders and admins can modify reminder settings. You can view the current configuration below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Evaluation Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadlineDays">Evaluation Deadline (Days)</Label>
              <Input
                id="deadlineDays"
                type="number"
                min="7"
                max="30"
                value={config.evaluationDeadlineDays}
                onChange={(e) => updateConfig('evaluationDeadlineDays', parseInt(e.target.value))}
                disabled={!canManageReminders}
              />
              <p className="text-sm text-gray-500">
                Evaluations must be completed every {config.evaluationDeadlineDays} days
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderDays">Reminder Days Before Deadline</Label>
              <Input
                id="reminderDays"
                type="number"
                min="1"
                max="7"
                value={config.reminderDaysBefore}
                onChange={(e) => updateConfig('reminderDaysBefore', parseInt(e.target.value))}
                disabled={!canManageReminders}
              />
              <p className="text-sm text-gray-500">
                Send reminders {config.reminderDaysBefore} days before deadline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500">Send reminder emails to evaluators</p>
              </div>
              <Switch
                checked={config.emailEnabled}
                onCheckedChange={(checked) => updateConfig('emailEnabled', checked)}
                disabled={!canManageReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  In-App Notifications
                </Label>
                <p className="text-sm text-gray-500">Show reminders in the application</p>
              </div>
              <Switch
                checked={config.inAppEnabled}
                onCheckedChange={(checked) => updateConfig('inAppEnabled', checked)}
                disabled={!canManageReminders}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminderTitle">Reminder Title</Label>
            <Input
              id="reminderTitle"
              value={config.reminderTitle}
              onChange={(e) => updateConfig('reminderTitle', e.target.value)}
              disabled={!canManageReminders}
              placeholder="Enter reminder title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminderMessage">Reminder Message</Label>
            <Textarea
              id="reminderMessage"
              value={config.reminderMessage}
              onChange={(e) => updateConfig('reminderMessage', e.target.value)}
              disabled={!canManageReminders}
              placeholder="Enter reminder message"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Escalation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Escalation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Escalation</Label>
              <p className="text-sm text-gray-500">
                Automatically escalate overdue evaluations to supervisors
              </p>
            </div>
            <Switch
              checked={config.escalationEnabled}
              onCheckedChange={(checked) => updateConfig('escalationEnabled', checked)}
              disabled={!canManageReminders}
            />
          </div>
          
          {config.escalationEnabled && (
            <div className="space-y-2">
              <Label htmlFor="escalationDays">Escalation Delay (Days)</Label>
              <Input
                id="escalationDays"
                type="number"
                min="1"
                max="7"
                value={config.escalationDays}
                onChange={(e) => updateConfig('escalationDays', parseInt(e.target.value))}
                disabled={!canManageReminders}
              />
              <p className="text-sm text-gray-500">
                Escalate {config.escalationDays} days after deadline passes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Reminder System Active</Label>
              <p className="text-sm text-gray-500">
                {config.isActive ? 'System is running and sending reminders' : 'System is disabled'}
              </p>
            </div>
            <Switch
              checked={config.isActive}
              onCheckedChange={(checked) => updateConfig('isActive', checked)}
              disabled={!canManageReminders}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {canManageReminders && (
        <div className="flex justify-end">
          <Button 
            onClick={saveReminderConfig}
            disabled={saving}
            className="min-w-32"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      )}

      {/* Current Settings Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Current Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Evaluation Cycle:</strong> Every {config.evaluationDeadlineDays} days
            </div>
            <div>
              <strong>Reminder Timing:</strong> {config.reminderDaysBefore} days before deadline
            </div>
            <div>
              <strong>Email Notifications:</strong> {config.emailEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <div>
              <strong>In-App Notifications:</strong> {config.inAppEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <div>
              <strong>Escalation:</strong> {config.escalationEnabled ? `After ${config.escalationDays} days` : 'Disabled'}
            </div>
            <div>
              <strong>System Status:</strong> {config.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderSystemConfig;
