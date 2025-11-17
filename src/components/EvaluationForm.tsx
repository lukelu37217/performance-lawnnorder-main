import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Worker, Foreman, Manager, Evaluation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { calculateTotalScore, calculateRating } from '@/utils/scoringLogic';
import { supabase } from '@/integrations/supabase/client';

// Evaluation criteria matching the updated scoring guide exactly
const evaluationCriteria = {
  performance: [
    { 
      key: 'projectCompletion', 
      label: 'Project Completion (%)',
      options: [
        { value: 0, label: '<70% completion' },
        { value: 1, label: '≥70% completion' },
        { value: 2, label: '≥80% completion' },
        { value: 3, label: '100% completion' }
      ]
    },
    { 
      key: 'qualityIssues', 
      label: 'Quality Issues',
      options: [
        { value: 0, label: '2+ major issues' },
        { value: 1, label: '2 minor issues' },
        { value: 2, label: '1 minor issue' },
        { value: 3, label: 'No issues' }
      ]
    },
    { 
      key: 'toolCare', 
      label: 'Tool Care & Clean-up',
      options: [
        { value: 0, label: 'Deliberately ignored' },
        { value: 1, label: 'Neglected' },
        { value: 2, label: 'Partially cleaned' },
        { value: 3, label: 'Fully cleaned' }
      ]
    },
    { 
      key: 'equipmentEtiquette', 
      label: 'Equipment & Vehicle Etiquette',
      options: [
        { value: 0, label: 'Unsafe behavior' },
        { value: 1, label: 'Careless use' },
        { value: 2, label: 'Minor misuse' },
        { value: 3, label: 'Always responsible' }
      ]
    }
  ],
  safety: [
    { 
      key: 'nearMiss', 
      label: 'Near Miss Reported',
      options: [
        { value: 0, label: 'No (missed opportunity)' },
        { value: 3, label: 'Yes (promotes safety culture)' }
      ]
    },
    { 
      key: 'incident', 
      label: 'Incident Occurred',
      options: [
        { value: 0, label: 'Yes (safety failure)' },
        { value: 3, label: 'No (positive outcome)' }
      ]
    }
  ],
  behavior: [
    { 
      key: 'attendance', 
      label: 'Attendance',
      options: [
        { value: 0, label: '2+ unexcused absences' },
        { value: 1, label: '2 lates/absences' },
        { value: 2, label: '1 late' },
        { value: 3, label: 'Perfect' }
      ]
    },
    { 
      key: 'attitude', 
      label: 'Attitude / Professionalism',
      options: [
        { value: 0, label: 'Very Poor' },
        { value: 1, label: 'Poor' },
        { value: 2, label: 'Average' },
        { value: 3, label: 'Excellent' }
      ]
    },
    { 
      key: 'taskOwnership', 
      label: 'Task Ownership',
      options: [
        { value: 0, label: 'Uncooperative' },
        { value: 1, label: 'Passive' },
        { value: 2, label: 'Needs reminders' },
        { value: 3, label: 'Proactive' }
      ]
    }
  ],
  teamwork: [
    { 
      key: 'customerInteraction', 
      label: 'Customer Interaction',
      options: [
        { value: 0, label: 'Complaint/negative' },
        { value: 1, label: 'Cold/indifferent' },
        { value: 2, label: 'Neutral' },
        { value: 3, label: 'Positive' }
      ]
    },
    { 
      key: 'teamwork', 
      label: 'Teamwork on Job Site',
      options: [
        { value: 0, label: 'Ignores team' },
        { value: 1, label: 'Occasionally disrupts' },
        { value: 2, label: 'Minor issues' },
        { value: 3, label: 'Seamless' }
      ]
    }
  ]
};

const EvaluationForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for database data
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [currentUserForeman, setCurrentUserForeman] = useState<Foreman | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvaluateeId, setSelectedEvaluateeId] = useState('');
  const [evaluateeType, setEvaluateeType] = useState<'worker' | 'foreman'>('worker');
  const [scores, setScores] = useState({
    projectCompletion: 0, qualityIssues: 0, toolCare: 0, equipmentEtiquette: 0,
    nearMiss: 0, incident: 0, attendance: 0, attitude: 0, taskOwnership: 0,
    customerInteraction: 0, teamwork: 0
  });
  const [notes, setNotes] = useState('');

  // Calculate current total score and rating in real-time
  const currentTotalScore = useMemo(() => calculateTotalScore(scores), [scores]);
  const currentRating = useMemo(() => calculateRating(currentTotalScore), [currentTotalScore]);

  // Load data from database based on user role
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('🔄 Loading evaluation data for user:', user);
        
        const [allWorkers, allForemen, allManagers] = await Promise.all([
          supabase.from('workers').select('*'),
          supabase.from('foremen').select('*'),
          supabase.from('managers').select('*')
        ]);

        if (allWorkers.error) throw allWorkers.error;
        if (allForemen.error) throw allForemen.error;
        if (allManagers.error) throw allManagers.error;

        console.log('📊 Raw data loaded:', { 
          allWorkers: allWorkers.data, 
          allForemen: allForemen.data, 
          allManagers: allManagers.data 
        });

        // Transform database data to match TypeScript interfaces
        const transformedWorkers = (allWorkers.data || []).map(w => ({
          id: w.id,
          name: w.name,
          foremanId: w.foreman_id,
          evaluations: [],
          createdAt: new Date(w.created_at)
        }));

        const transformedForemen = (allForemen.data || []).map(f => ({
          id: f.id,
          name: f.name,
          managerId: f.manager_id,
          createdAt: new Date(f.created_at)
        }));

        const transformedManagers = (allManagers.data || []).map(m => ({
          id: m.id,
          name: m.name,
          leaderId: m.leader_id,
          createdAt: new Date(m.created_at)
        }));

        // Filter data based on user role and entityId
        let filteredWorkers: Worker[] = [];
        let filteredForemen: Foreman[] = [];
        let userForeman: Foreman | null = null;

        switch (user.role) {
          case 'admin':
          case 'leader':
            // Admin and leaders can see all
            filteredWorkers = transformedWorkers;
            filteredForemen = transformedForemen;
            break;
            
          case 'manager':
            // Managers can evaluate foremen under them and workers under those foremen
            filteredForemen = transformedForemen.filter(f => f.managerId === user.entityId);
            const foremanIds = filteredForemen.map(f => f.id);
            filteredWorkers = transformedWorkers.filter(w => foremanIds.includes(w.foremanId));
            break;
            
          case 'foreman':
            // Foremen can only evaluate workers in their team
            filteredWorkers = transformedWorkers.filter(w => w.foremanId === user.entityId);
            filteredForemen = []; // Foremen can't evaluate other foremen
            
            // Get the current user's foreman info for display purposes
            userForeman = transformedForemen.find(f => f.id === user.entityId) || null;
            break;
            
          default:
            filteredWorkers = [];
            filteredForemen = [];
        }

        console.log('✅ Filtered data for role', user.role, ':', { 
          filteredWorkers, 
          filteredForemen,
          userForeman 
        });
        
        setWorkers(filteredWorkers);
        setForemen(filteredForemen);
        setManagers(transformedManagers);
        setCurrentUserForeman(userForeman);
      } catch (error) {
        console.error('❌ Error loading evaluation data:', error);
        toast({
          title: "Error",
          description: "Failed to load evaluation data from database",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Get available evaluatees based on user role
  const availableEvaluatees = useMemo(() => {
    return { workers, foremen };
  }, [workers, foremen]);

  const canEvaluateForemen = user?.role === 'admin' || user?.role === 'leader' || user?.role === 'manager';

  const handleScoreChange = (criterion: string, value: number) => {
    setScores(prev => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvaluateeId || !user) {
      toast({
        title: "Error",
        description: "Please select someone to evaluate.",
        variant: "destructive",
      });
      return;
    }

    try {
      const totalScore = calculateTotalScore(scores);
      const rating = calculateRating(totalScore);

      const newEvaluation = {
        ...(evaluateeType === 'worker' ? { worker_id: selectedEvaluateeId } : { foreman_id: selectedEvaluateeId }),
        evaluator_id: user.entityId,
        evaluator_role: user.role === 'admin' ? 'leader' : user.role as 'leader' | 'manager' | 'foreman',
        evaluatee_type: evaluateeType,
        evaluation_date: new Date().toISOString(),
        period: 'biweekly',
        biweekly_period: Math.ceil((new Date().getTime() / (1000 * 60 * 60 * 24 * 14))),
        scores,
        total_score: totalScore,
        rating,
        notes
      };

      // Save evaluation to database
      const { error } = await supabase
        .from('evaluations')
        .insert([newEvaluation]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Evaluation submitted successfully. Rating: ${rating}`,
      });

      // Reset form
      setSelectedEvaluateeId('');
      setScores({
        projectCompletion: 0, qualityIssues: 0, toolCare: 0, equipmentEtiquette: 0,
        nearMiss: 0, incident: 0, attendance: 0, attitude: 0, taskOwnership: 0,
        customerInteraction: 0, teamwork: 0
      });
      setNotes('');
    } catch (error) {
      console.error('❌ Error submitting evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive"
      });
    }
  };

  const getEvaluateeName = (id: string, type: 'worker' | 'foreman') => {
    if (type === 'worker') {
      const worker = workers.find(w => w.id === id);
      if (!worker) return '';
      
      // For foreman users, use their own foreman info
      if (user?.role === 'foreman' && currentUserForeman) {
        return `${worker.name} (${currentUserForeman.name}'s team)`;
      }
      
      // For other roles, find the foreman from the foremen array
      const foreman = foremen.find(f => f.id === worker.foremanId);
      return `${worker.name} (${foreman?.name || 'Unknown foreman'}'s team)`;
    } else {
      const foreman = foremen.find(f => f.id === id);
      const manager = managers.find(m => m.id === foreman?.managerId);
      return foreman ? `${foreman.name} (Foreman${manager ? `, under ${manager.name}` : ''})` : '';
    }
  };

  const renderScoreSection = (title: string, criteria: any[]) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {criteria.map(criterion => (
        <div key={criterion.key} className="space-y-2">
          <Label htmlFor={criterion.key}>{criterion.label}</Label>
          <Select onValueChange={(value) => handleScoreChange(criterion.key, parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select score" />
            </SelectTrigger>
            <SelectContent>
              {criterion.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.value} - {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading evaluation data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" lang="en">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Biweekly Performance Evaluation
            <Badge variant="outline">{user?.role.toUpperCase()}</Badge>
          </CardTitle>
          <CardDescription>
            Evaluate performance across 4 key categories. Each criterion is scored based on specific criteria.
            <br />
            <span className="text-sm text-blue-600">
              Logged in as: {user?.name} | Role: {user?.role}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Score Display */}
            <Card className="bg-gray-50 border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Current Score
                  <Badge 
                    variant={currentRating === 'A' ? 'default' : currentRating === 'B' ? 'secondary' : 'destructive'}
                    className="text-lg px-3 py-1"
                  >
                    {currentRating} Rating
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {currentTotalScore}/33
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentRating === 'A' && 'Exceptional Performance (27-33 points)'}
                    {currentRating === 'B' && 'Good Performance (21-26 points)'}
                    {currentRating === 'C' && 'Needs Improvement (0-20 points)'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluatee Type Selection */}
            {canEvaluateForemen && availableEvaluatees.foremen.length > 0 && (
              <div className="space-y-2">
                <Label>Evaluation Type</Label>
                <Select value={evaluateeType} onValueChange={(value: 'worker' | 'foreman') => {
                  setEvaluateeType(value);
                  setSelectedEvaluateeId('');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">Evaluate Worker</SelectItem>
                    <SelectItem value="foreman">Evaluate Foreman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Evaluatee Selection */}
            <div className="space-y-2">
              <Label htmlFor="evaluatee">
                Select {evaluateeType === 'worker' ? 'Worker' : 'Foreman'}
              </Label>
              <Select value={selectedEvaluateeId} onValueChange={setSelectedEvaluateeId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${evaluateeType} to evaluate`} />
                </SelectTrigger>
                <SelectContent>
                  {evaluateeType === 'worker' 
                    ? availableEvaluatees.workers.map(worker => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {getEvaluateeName(worker.id, 'worker')}
                        </SelectItem>
                      ))
                    : availableEvaluatees.foremen.map(foreman => (
                        <SelectItem key={foreman.id} value={foreman.id}>
                          {getEvaluateeName(foreman.id, 'foreman')}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Show message if no evaluatees available */}
            {evaluateeType === 'worker' && availableEvaluatees.workers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No workers assigned to you for evaluation.</p>
              </div>
            )}

            {evaluateeType === 'foreman' && availableEvaluatees.foremen.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No foremen under your supervision for evaluation.</p>
              </div>
            )}

            {/* Performance Category */}
            {renderScoreSection('Performance', evaluationCriteria.performance)}
            
            {/* Safety Category */}
            {renderScoreSection('Safety', evaluationCriteria.safety)}
            
            {/* Behavior & Attitude Category */}
            {renderScoreSection('Behavior & Attitude', evaluationCriteria.behavior)}
            
            {/* Teamwork & Customer Interaction Category */}
            {renderScoreSection('Teamwork & Customer Interaction', evaluationCriteria.teamwork)}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional comments or observations..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={!selectedEvaluateeId || (evaluateeType === 'worker' && availableEvaluatees.workers.length === 0) || (evaluateeType === 'foreman' && availableEvaluatees.foremen.length === 0)}
            >
              Submit Evaluation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationForm;
