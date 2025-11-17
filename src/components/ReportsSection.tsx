
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Users, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Worker, Foreman } from '@/types';
import { getRatingDescription, getCategoryScore } from '@/utils/scoringLogic';
import { useToast } from '@/hooks/use-toast';

const ReportsSection = () => {
  const [workers] = useLocalStorage<Worker[]>('workers', []);
  const [foremen] = useLocalStorage<Foreman[]>('foremen', []);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedForemanId, setSelectedForemanId] = useState('');
  const { toast } = useToast();

  const generateWorkerPDF = async (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || worker.evaluations.length === 0) {
      toast({
        title: "Error",
        description: "Worker not found or no evaluations available",
        variant: "destructive"
      });
      return;
    }

    const latestEval = worker.evaluations[worker.evaluations.length - 1];
    const foreman = foremen.find(f => f.id === worker.foremanId);

    // Create a simple text-based report (in a real app, you'd use a PDF library)
    const reportContent = `
WORKER PERFORMANCE REPORT
========================

Worker: ${worker.name}
Foreman: ${foreman?.name || 'Unknown'}
Evaluation Date: ${new Date(latestEval.date).toLocaleDateString()}
Total Score: ${latestEval.totalScore}/33
Rating: ${latestEval.rating}
Description: ${getRatingDescription(latestEval.rating)}

CATEGORY BREAKDOWN:
------------------
Performance: ${getCategoryScore(latestEval.scores, 'Performance').score}/12
Safety: ${getCategoryScore(latestEval.scores, 'Safety').score}/6
Behavior & Attitude: ${getCategoryScore(latestEval.scores, 'Behavior & Attitude').score}/9
Teamwork & Customer Interaction: ${getCategoryScore(latestEval.scores, 'Teamwork & Customer Interaction').score}/6

DETAILED SCORES:
---------------
Project Completion: ${latestEval.scores.projectCompletion}/3
Quality Issues: ${latestEval.scores.qualityIssues}/3
Tool Care & Clean-up: ${latestEval.scores.toolCare}/3
Equipment & Vehicle Etiquette: ${latestEval.scores.equipmentEtiquette}/3
Near Miss Reported: ${latestEval.scores.nearMiss}/3
Incident Occurred: ${latestEval.scores.incident}/3
Attendance: ${latestEval.scores.attendance}/3
Attitude / Professionalism: ${latestEval.scores.attitude}/3
Task Ownership: ${latestEval.scores.taskOwnership}/3
Customer Interaction: ${latestEval.scores.customerInteraction}/3
Teamwork on Job Site: ${latestEval.scores.teamwork}/3

${latestEval.notes ? `\nNOTES:\n${latestEval.notes}` : ''}
    `;

    // Download as text file (in a real app, you'd generate a proper PDF)
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worker.name}_performance_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Worker report downloaded successfully"
    });
  };

  const generateTeamPDF = async (foremanId: string) => {
    const foreman = foremen.find(f => f.id === foremanId);
    const teamWorkers = workers.filter(w => w.foremanId === foremanId);
    
    if (!foreman || teamWorkers.length === 0) {
      toast({
        title: "Error",
        description: "Foreman not found or no team members",
        variant: "destructive"
      });
      return;
    }

    const evaluatedWorkers = teamWorkers.filter(w => w.evaluations.length > 0);
    
    let reportContent = `
TEAM PERFORMANCE REPORT
======================

Foreman: ${foreman.name}
Team Size: ${teamWorkers.length}
Evaluated Workers: ${evaluatedWorkers.length}
Report Date: ${new Date().toLocaleDateString()}

TEAM SUMMARY:
------------
`;

    if (evaluatedWorkers.length > 0) {
      const totalScore = evaluatedWorkers.reduce((sum, worker) => {
        const latest = worker.evaluations[worker.evaluations.length - 1];
        return sum + latest.totalScore;
      }, 0);
      
      const averageScore = totalScore / evaluatedWorkers.length;
      const ratingCounts = { A: 0, B: 0, C: 0 };
      
      evaluatedWorkers.forEach(worker => {
        const latest = worker.evaluations[worker.evaluations.length - 1];
        ratingCounts[latest.rating]++;
      });

      reportContent += `
Average Team Score: ${Math.round(averageScore * 10) / 10}/33
Rating Distribution:
- A Ratings: ${ratingCounts.A}
- B Ratings: ${ratingCounts.B}
- C Ratings: ${ratingCounts.C}

INDIVIDUAL WORKER DETAILS:
-------------------------
`;

      evaluatedWorkers.forEach(worker => {
        const latest = worker.evaluations[worker.evaluations.length - 1];
        reportContent += `
${worker.name}:
  Score: ${latest.totalScore}/33
  Rating: ${latest.rating}
  Last Evaluated: ${new Date(latest.date).toLocaleDateString()}
`;
      });
    } else {
      reportContent += "\nNo evaluations available for this team.\n";
    }

    const unevaluatedWorkers = teamWorkers.filter(w => w.evaluations.length === 0);
    if (unevaluatedWorkers.length > 0) {
      reportContent += `\nUNEVALUATED WORKERS:\n`;
      unevaluatedWorkers.forEach(worker => {
        reportContent += `- ${worker.name}\n`;
      });
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${foreman.name}_team_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Team report downloaded successfully"
    });
  };

  const evaluatedWorkers = workers.filter(w => w.evaluations.length > 0);

  return (
    <div className="space-y-6">
      {/* Individual Worker Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Individual Worker Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select value={selectedWorkerId || 'select-worker'} onValueChange={setSelectedWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a worker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-worker" disabled>Select a worker</SelectItem>
                  {evaluatedWorkers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} ({worker.evaluations.length} evaluations)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => selectedWorkerId && selectedWorkerId !== 'select-worker' && generateWorkerPDF(selectedWorkerId)}
              disabled={!selectedWorkerId || selectedWorkerId === 'select-worker'}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Worker Report
            </Button>
          </div>
          
          {selectedWorkerId && selectedWorkerId !== 'select-worker' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {(() => {
                const worker = workers.find(w => w.id === selectedWorkerId);
                const latestEval = worker?.evaluations[worker.evaluations.length - 1];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Latest Score:</strong> {latestEval?.totalScore}/33
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Rating:</strong>
                      <Badge variant={
                        latestEval?.rating === 'A' ? 'default' :
                        latestEval?.rating === 'B' ? 'secondary' : 'destructive'
                      }>
                        {latestEval?.rating}
                      </Badge>
                    </div>
                    <div>
                      <strong>Total Evaluations:</strong> {worker?.evaluations.length}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Summary Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select value={selectedForemanId || 'select-foreman'} onValueChange={setSelectedForemanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a foreman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-foreman" disabled>Select a foreman</SelectItem>
                  {foremen.map(foreman => {
                    const teamSize = workers.filter(w => w.foremanId === foreman.id).length;
                    return (
                      <SelectItem key={foreman.id} value={foreman.id}>
                        {foreman.name} ({teamSize} workers)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => selectedForemanId && selectedForemanId !== 'select-foreman' && generateTeamPDF(selectedForemanId)}
              disabled={!selectedForemanId || selectedForemanId === 'select-foreman'}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Team Report
            </Button>
          </div>

          {selectedForemanId && selectedForemanId !== 'select-foreman' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {(() => {
                const teamWorkers = workers.filter(w => w.foremanId === selectedForemanId);
                const evaluatedTeam = teamWorkers.filter(w => w.evaluations.length > 0);
                const avgScore = evaluatedTeam.length > 0 
                  ? evaluatedTeam.reduce((sum, worker) => {
                      const latest = worker.evaluations[worker.evaluations.length - 1];
                      return sum + latest.totalScore;
                    }, 0) / evaluatedTeam.length
                  : 0;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Team Size:</strong> {teamWorkers.length}
                    </div>
                    <div>
                      <strong>Evaluated:</strong> {evaluatedTeam.length}
                    </div>
                    <div>
                      <strong>Avg Score:</strong> {Math.round(avgScore * 10) / 10}/33
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports Available</p>
                <p className="text-2xl font-bold">{evaluatedWorkers.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teams with Data</p>
                <p className="text-2xl font-bold">
                  {foremen.filter(f => 
                    workers.some(w => w.foremanId === f.id && w.evaluations.length > 0)
                  ).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold">
                  {workers.reduce((sum, worker) => sum + worker.evaluations.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsSection;
