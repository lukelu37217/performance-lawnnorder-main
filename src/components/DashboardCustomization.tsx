
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export interface DashboardSettings {
  chartType: 'bar' | 'pie' | 'line';
  selectedMetrics: string[];
}

interface DashboardCustomizationProps {
  settings: DashboardSettings;
  onSettingsChange: (settings: DashboardSettings) => void;
}

const DashboardCustomization = ({ settings, onSettingsChange }: DashboardCustomizationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableMetrics = [
    { id: 'totalScore', label: 'Total Score', description: 'Overall performance scores' },
    { id: 'attendance', label: 'Attendance', description: 'Attendance ratings' },
    { id: 'qualityIssues', label: 'Quality Issues', description: 'Quality performance metrics' },
    { id: 'projectCompletion', label: 'Project Completion', description: 'Project completion rates' },
    { id: 'teamwork', label: 'Teamwork', description: 'Team collaboration scores' },
    { id: 'attitude', label: 'Attitude', description: 'Attitude and behavior ratings' },
    { id: 'toolCare', label: 'Tool Care', description: 'Equipment and tool management' },
    { id: 'safety', label: 'Safety', description: 'Safety incidents and near misses' }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'line', label: 'Line Chart', icon: TrendingUp }
  ];

  const handleChartTypeChange = (chartType: 'bar' | 'pie' | 'line') => {
    onSettingsChange({
      ...settings,
      chartType
    });
  };

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = settings.selectedMetrics.includes(metricId)
      ? settings.selectedMetrics.filter(id => id !== metricId)
      : [...settings.selectedMetrics, metricId];
    
    onSettingsChange({
      ...settings,
      selectedMetrics: newMetrics
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="mb-4"
      >
        <Settings className="w-4 h-4 mr-2" />
        Customize Dashboard
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Dashboard Customization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Chart Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {chartTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={settings.chartType === type.value ? 'default' : 'outline'}
                  onClick={() => handleChartTypeChange(type.value as 'bar' | 'pie' | 'line')}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Performance Metrics to Display</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableMetrics.map((metric) => (
              <div key={metric.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={metric.id}
                  checked={settings.selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => handleMetricToggle(metric.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={metric.id} className="font-medium cursor-pointer">
                    {metric.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onSettingsChange({
                chartType: 'bar',
                selectedMetrics: ['totalScore', 'attendance', 'qualityIssues', 'projectCompletion']
              });
            }}
          >
            Reset to Default
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Apply Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCustomization;
