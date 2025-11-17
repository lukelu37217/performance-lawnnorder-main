
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/database';
import { Evaluation, Worker, Foreman } from '@/types';

interface EvaluationEditDialogProps {
  evaluation: Evaluation & { workerName: string; foremanName: string } | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  workers: Worker[];
  foremen: Foreman[];
}

const EvaluationEditDialog = ({ evaluation, open, onClose, onUpdate, workers, foremen }: EvaluationEditDialogProps) => {
  const [notes, setNotes] = useState('');
  const [scores, setScores] = useState({
    projectCompletion: 0,
    qualityIssues: 0,
    toolCare: 0,
    equipmentEtiquette: 0,
    nearMiss: 0,
    incident: 0,
    attendance: 0,
    attitude: 0,
    taskOwnership: 0,
    customerInteraction: 0,
    teamwork: 0
  });
  const [totalScore, setTotalScore] = useState(0);
  const [rating, setRating] = useState<'A' | 'B' | 'C'>('B');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (evaluation) {
      setNotes(evaluation.notes || '');
      setScores(evaluation.scores);
      setTotalScore(evaluation.totalScore);
      setRating(evaluation.rating);
    }
  }, [evaluation]);

  useEffect(() => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    setTotalScore(total);
    
    // Calculate rating based on total score
    if (total >= 30) setRating('A');
    else if (total >= 25) setRating('B');
    else setRating('C');
  }, [scores]);

  const handleScoreChange = (category: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = async () => {
    if (!evaluation) return;

    try {
      setLoading(true);
      
      const updatedEvaluation = {
        ...evaluation,
        scores,
        totalScore,
        rating,
        notes: notes.trim()
      };

      await dbService.updateEvaluation(evaluation.id, updatedEvaluation);
      
      toast({
        title: "Success",
        description: "Evaluation updated successfully"
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to update evaluation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scoreCategories = [
    { key: 'projectCompletion', label: 'Project Completion', max: 3 },
    { key: 'qualityIssues', label: 'Quality Issues', max: 3 },
    { key: 'toolCare', label: 'Tool Care', max: 3 },
    { key: 'equipmentEtiquette', label: 'Equipment Etiquette', max: 3 },
    { key: 'nearMiss', label: 'Near Miss', max: 3 },
    { key: 'incident', label: 'Incident', max: 3 },
    { key: 'attendance', label: 'Attendance', max: 3 },
    { key: 'attitude', label: 'Attitude', max: 3 },
    { key: 'taskOwnership', label: 'Task Ownership', max: 3 },
    { key: 'customerInteraction', label: 'Customer Interaction', max: 3 },
    { key: 'teamwork', label: 'Teamwork', max: 3 }
  ];

  if (!evaluation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Evaluation - {evaluation.workerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Evaluation Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-500">Worker</Label>
              <p className="font-medium">{evaluation.workerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Foreman</Label>
              <p className="font-medium">{evaluation.foremanName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Date</Label>
              <p className="font-medium">{new Date(evaluation.date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Current Rating</Label>
              <Badge variant={rating === 'A' ? 'default' : rating === 'B' ? 'secondary' : 'destructive'}>
                {rating}
              </Badge>
            </div>
          </div>

          {/* Scores */}
          <div>
            <Label className="text-lg font-semibold">Performance Scores</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {scoreCategories.map(category => (
                <div key={category.key} className="space-y-2">
                  <Label htmlFor={category.key}>{category.label}</Label>
                  <Select
                    value={scores[category.key as keyof typeof scores].toString()}
                    onValueChange={(value) => handleScoreChange(category.key, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: category.max + 1 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Total Score */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Score:</span>
              <span className="text-2xl font-bold">{totalScore}/33</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold">Rating:</span>
              <Badge variant={rating === 'A' ? 'default' : rating === 'B' ? 'secondary' : 'destructive'}>
                {rating}
              </Badge>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes about this evaluation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationEditDialog;
