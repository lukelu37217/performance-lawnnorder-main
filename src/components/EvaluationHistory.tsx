import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Search, Calendar } from 'lucide-react';
import { Worker, Foreman, Evaluation } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/database';
import EvaluationEditDialog from './EvaluationEditDialog';

const EvaluationHistory = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedForeman, setSelectedForeman] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'worker' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [editingEvaluation, setEditingEvaluation] = useState<(Evaluation & { workerName: string; foremanName: string }) | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersData, foremenData, evaluationsData] = await Promise.all([
        dbService.getWorkers(),
        dbService.getForemen(),
        dbService.getEvaluations()
      ]);
      setWorkers(workersData);
      setForemen(foremenData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const allEvaluationsWithNames = useMemo(() => {
    return evaluations.map(evaluation => {
      const worker = workers.find(w => w.id === evaluation.workerId);
      // Find foreman through worker's foremanId, not evaluation's foremanId
      const foreman = worker ? foremen.find(f => f.id === worker.foremanId) : null;
      
      return {
        ...evaluation,
        workerName: worker?.name || 'Unknown',
        foremanName: foreman?.name || 'Unknown'
      };
    });
  }, [evaluations, workers, foremen]);

  const filteredEvaluations = useMemo(() => {
    let filtered = allEvaluationsWithNames;

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(evaluation => 
        evaluation.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.foremanName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedWorker && selectedWorker !== 'all-workers') {
      filtered = filtered.filter(evaluation => evaluation.workerId === selectedWorker);
    }

    if (selectedForeman && selectedForeman !== 'all-foremen') {
      const worker = workers.find(w => w.foremanId === selectedForeman);
      if (worker) {
        filtered = filtered.filter(evaluation => evaluation.workerId === worker.id);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'worker':
          comparison = a.workerName.localeCompare(b.workerName);
          break;
        case 'score':
          comparison = a.totalScore - b.totalScore;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allEvaluationsWithNames, searchTerm, selectedWorker, selectedForeman, sortBy, sortOrder, workers]);

  const deleteEvaluation = async (evaluationId: string) => {
    if (!confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      return;
    }

    try {
      await dbService.deleteEvaluation(evaluationId);
      
      // Update local state
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
      
      toast({
        title: "Success",
        description: "Evaluation deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to delete evaluation",
        variant: "destructive"
      });
    }
  };

  const handleEditEvaluation = (evaluation: Evaluation & { workerName: string; foremanName: string }) => {
    setEditingEvaluation(evaluation);
  };

  const handleCloseEditDialog = () => {
    setEditingEvaluation(null);
  };

  const handleUpdateEvaluation = () => {
    loadData(); // Refresh data after update
    setEditingEvaluation(null);
  };

  const handleSort = (field: 'date' | 'worker' | 'score') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading evaluation history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Evaluation History Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by worker or foreman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="worker-filter">Filter by Worker</Label>
              <Select value={selectedWorker || 'all-workers'} onValueChange={setSelectedWorker}>
                <SelectTrigger>
                  <SelectValue placeholder="All Workers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-workers">All Workers</SelectItem>
                  {workers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="foreman-filter">Filter by Foreman</Label>
              <Select value={selectedForeman || 'all-foremen'} onValueChange={setSelectedForeman}>
                <SelectTrigger>
                  <SelectValue placeholder="All Foremen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-foremen">All Foremen</SelectItem>
                  {foremen.map(foreman => (
                    <SelectItem key={foreman.id} value={foreman.id}>
                      {foreman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWorker('');
                  setSelectedForeman('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Evaluation Records ({filteredEvaluations.length} found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('worker')}
                  >
                    Worker {sortBy === 'worker' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Foreman</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('score')}
                  >
                    Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map(evaluation => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      {new Date(evaluation.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {evaluation.workerName}
                    </TableCell>
                    <TableCell>{evaluation.foremanName}</TableCell>
                    <TableCell>
                      <span className="font-mono">{evaluation.totalScore}/33</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        evaluation.rating === 'A' ? 'default' :
                        evaluation.rating === 'B' ? 'secondary' : 'destructive'
                      }>
                        {evaluation.rating}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {evaluation.notes || 'No notes'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvaluation(evaluation)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEvaluation(evaluation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEvaluations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No evaluation records found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EvaluationEditDialog
        evaluation={editingEvaluation}
        open={!!editingEvaluation}
        onClose={handleCloseEditDialog}
        onUpdate={handleUpdateEvaluation}
        workers={workers}
        foremen={foremen}
      />
    </div>
  );
};

export default EvaluationHistory;
