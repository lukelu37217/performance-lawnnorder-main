
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableReminderDateProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  label: string;
}

const EditableReminderDate = ({ currentDate, onDateChange, label }: EditableReminderDateProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState(currentDate);
  const { toast } = useToast();

  const handleSave = () => {
    if (!editedDate) {
      toast({
        title: "Error",
        description: "Please enter a valid date",
        variant: "destructive"
      });
      return;
    }

    const selectedDate = new Date(editedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast({
        title: "Error",
        description: "Please select a future date",
        variant: "destructive"
      });
      return;
    }

    onDateChange(editedDate);
    setIsEditing(false);
    toast({
      title: "Success",
      description: `${label} updated successfully`
    });
  };

  const handleCancel = () => {
    setEditedDate(currentDate);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="edit-date" className="text-sm font-medium text-gray-500">
            {label}
          </Label>
          <Input
            id="edit-date"
            type="date"
            value={editedDate}
            onChange={(e) => setEditedDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex gap-1 mt-6">
          <Button size="sm" onClick={handleSave}>
            <Save className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium text-gray-500">{label}</Label>
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-lg">{new Date(currentDate).toLocaleDateString()}</span>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default EditableReminderDate;
