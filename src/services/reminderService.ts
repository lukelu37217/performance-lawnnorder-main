
import { supabase } from '@/integrations/supabase/client';

export interface ReminderConfig {
  id?: string;
  evaluationDeadlineDays: number;
  reminderDaysBefore: number;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  reminderTitle: string;
  reminderMessage: string;
  escalationEnabled: boolean;
  escalationDays: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
}

export const reminderService = {
  async getReminderConfig(): Promise<ReminderConfig | null> {
    const { data, error } = await supabase
      .from('reminder_configs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching reminder config:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      evaluationDeadlineDays: data.evaluation_deadline_days,
      reminderDaysBefore: data.reminder_days_before,
      emailEnabled: data.email_enabled,
      inAppEnabled: data.in_app_enabled,
      reminderTitle: data.reminder_title,
      reminderMessage: data.reminder_message,
      escalationEnabled: data.escalation_enabled,
      escalationDays: data.escalation_days,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      updatedBy: data.updated_by
    };
  },

  async updateReminderConfig(config: Partial<ReminderConfig>, userId: string): Promise<ReminderConfig> {
    // Get current config to get the ID
    const currentConfig = await this.getReminderConfig();
    
    if (!currentConfig?.id) {
      throw new Error('No reminder configuration found');
    }

    const { data, error } = await supabase
      .from('reminder_configs')
      .update({
        ...(config.evaluationDeadlineDays !== undefined && { evaluation_deadline_days: config.evaluationDeadlineDays }),
        ...(config.reminderDaysBefore !== undefined && { reminder_days_before: config.reminderDaysBefore }),
        ...(config.emailEnabled !== undefined && { email_enabled: config.emailEnabled }),
        ...(config.inAppEnabled !== undefined && { in_app_enabled: config.inAppEnabled }),
        ...(config.reminderTitle !== undefined && { reminder_title: config.reminderTitle }),
        ...(config.reminderMessage !== undefined && { reminder_message: config.reminderMessage }),
        ...(config.escalationEnabled !== undefined && { escalation_enabled: config.escalationEnabled }),
        ...(config.escalationDays !== undefined && { escalation_days: config.escalationDays }),
        ...(config.isActive !== undefined && { is_active: config.isActive }),
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .eq('id', currentConfig.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating reminder config:', error);
      throw error;
    }

    return {
      id: data.id,
      evaluationDeadlineDays: data.evaluation_deadline_days,
      reminderDaysBefore: data.reminder_days_before,
      emailEnabled: data.email_enabled,
      inAppEnabled: data.in_app_enabled,
      reminderTitle: data.reminder_title,
      reminderMessage: data.reminder_message,
      escalationEnabled: data.escalation_enabled,
      escalationDays: data.escalation_days,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      updatedBy: data.updated_by
    };
  },

  async checkCanManageReminders(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('can_manage_reminders', { user_id: userId });
    
    if (error) {
      console.error('Error checking reminder permissions:', error);
      return false;
    }
    
    return data || false;
  }
};
