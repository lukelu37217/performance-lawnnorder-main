import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { Worker, Foreman, Manager, DashboardFilters, Evaluation } from '@/types';
import { useNavigate } from 'react-router-dom';
import DashboardFiltersComponent from './DashboardFilters';
import ClickableDashboardCard from './ClickableDashboardCard';
import PerformanceScatterPlot from './PerformanceScatterPlot';
import { getBiweeklyEvaluations } from '@/utils/biweeklyUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('🔄 Loading dashboard data from Supabase...');
        
        const [workersData, foremenData, managersData, evaluationsData] = await Promise.all([
          supabase.from('workers').select('*'),
          supabase.from('foremen').select('*'),
          supabase.from('managers').select('*'),
          supabase.from('evaluations').select('*').order('evaluation_date', { ascending: false })
        ]);

        if (workersData.error) throw workersData.error;
        if (foremenData.error) throw foremenData.error;
        if (managersData.error) throw managersData.error;
        if (evaluationsData.error) throw evaluationsData.error;

        // Transform database data to match TypeScript interfaces
        const transformedWorkers = (workersData.data || []).map(w => ({
          id: w.id,
          name: w.name,
          foremanId: w.foreman_id,
          evaluations: [],
          createdAt: new Date(w.created_at)
        }));

        const transformedForemen = (foremenData.data || []).map(f => ({
          id: f.id,
          name: f.name,
          managerId: f.manager_id,
          createdAt: new Date(f.created_at)
        }));

        const transformedManagers = (managersData.data || []).map(m => ({
          id: m.id,
          name: m.name,
          leaderId: m.leader_id,
          createdAt: new Date(m.created_at)
        }));

        const transformedEvaluations = (evaluationsData.data || []).map(e => ({
          id: e.id,
          workerId: e.worker_id,
          foremanId: e.foreman_id,
          evaluatorId: e.evaluator_id,
          evaluatorRole: e.evaluator_role as 'leader' | 'manager' | 'foreman',
          evaluateeType: e.evaluatee_type as 'worker' | 'foreman',
          date: new Date(e.evaluation_date),
          period: e.period as 'biweekly',
          scores: e.scores as {
            projectCompletion: number;
            qualityIssues: number;
            toolCare: number;
            equipmentEtiquette: number;
            nearMiss: number;
            incident: number;
            attendance: number;
            attitude: number;
            taskOwnership: number;
            customerInteraction: number;
            teamwork: number;
          },
          totalScore: e.total_score,
          rating: e.rating as 'A' | 'B' | 'C',
          notes: e.notes,
          biweeklyPeriod: e.biweekly_period
        }));

        // Map evaluations to workers
        const workersWithEvaluations = transformedWorkers.map(worker => ({
          ...worker,
          evaluations: transformedEvaluations.filter(e => e.workerId === worker.id)
        }));

        console.log('✅ Dashboard data loaded:', { 
          workers: workersWithEvaluations.length, 
          foremen: transformedForemen.length,
          managers: transformedManagers.length,
          evaluations: transformedEvaluations.length 
        });
        
        setWorkers(workersWithEvaluations);
        setForemen(transformedForemen);
        setManagers(transformedManagers);
        setEvaluations(transformedEvaluations);
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const filteredData = useMemo(() => {
    let filteredWorkers = workers;
    
    // Apply foreman filter
    if (filters.foremanId) {
      filteredWorkers = filteredWorkers.filter(w => w.foremanId === filters.foremanId);
    }
    
    // Apply worker filter
    if (filters.workerId) {
      filteredWorkers = filteredWorkers.filter(w => w.id === filters.workerId);
    }

    return filteredWorkers;
  }, [workers, filters]);

  const dashboardData = useMemo(() => {
    const totalWorkers = filteredData.length;
    const totalForemen = filters.foremanId ? 1 : foremen.length;
    
    // Get all biweekly evaluations for workers (not just filtered workers for accurate counts)
    const allBiweeklyEvaluations = evaluations.filter(e => e.period === 'biweekly' && e.evaluateeType === 'worker');
    
    console.log('🔍 All biweekly evaluations:', allBiweeklyEvaluations);
    
    // Count unique workers that have been evaluated
    const evaluatedWorkerIds = new Set(allBiweeklyEvaluations.map(e => e.workerId).filter(Boolean));
    const evaluatedWorkers = evaluatedWorkerIds.size;
    
    console.log('👥 Evaluated worker IDs:', Array.from(evaluatedWorkerIds));
    console.log('📊 Evaluated workers count:', evaluatedWorkers);
    
    // Rating distribution - count ALL ratings, not just latest per worker
    const ratingCounts = { A: 0, B: 0, C: 0 };
    
    allBiweeklyEvaluations.forEach(evaluation => {
      ratingCounts[evaluation.rating]++;
      console.log(`📈 Evaluation ${evaluation.id} rating: ${evaluation.rating}`);
    });
    
    console.log('📊 Rating counts (all evaluations):', ratingCounts);

    // Team performance by foreman (biweekly only)
    const relevantForemen = filters.foremanId 
      ? foremen.filter(f => f.id === filters.foremanId)
      : foremen;

    const teamPerformance = relevantForemen.map(foreman => {
      const teamWorkers = filteredData.filter(w => w.foremanId === foreman.id);
      const evaluatedWorkers = teamWorkers.filter(w => {
        const biweeklyEvals = getBiweeklyEvaluations(w.evaluations);
        return biweeklyEvals.length > 0;
      });
      
      if (evaluatedWorkers.length === 0) {
        return { name: foreman.name, averageScore: 0, workerCount: teamWorkers.length };
      }

      const totalScore = evaluatedWorkers.reduce((sum, worker) => {
        const biweeklyEvals = getBiweeklyEvaluations(worker.evaluations);
        const latestEval = biweeklyEvals[biweeklyEvals.length - 1];
        return sum + latestEval.totalScore;
      }, 0);

      return {
        name: foreman.name,
        averageScore: Math.round(totalScore / evaluatedWorkers.length),
        workerCount: teamWorkers.length
      };
    });

    // Performance trends (last 12 weeks, biweekly)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks

    const recentEvaluations = filteredData.flatMap(worker => 
      getBiweeklyEvaluations(worker.evaluations).filter(evaluation => 
        new Date(evaluation.date) >= twelveWeeksAgo
      )
    );

    const performanceTrend = Array.from({ length: 6 }, (_, i) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - ((5 - i) * 14)); // 6 biweekly periods
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 13); // 2 week period
      
      const periodEvals = recentEvaluations.filter(evaluation => {
        const evalDate = new Date(evaluation.date);
        return evalDate >= startDate && evalDate <= endDate;
      });

      const avgScore = periodEvals.length > 0 
        ? periodEvals.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / periodEvals.length
        : 0;

      return {
        date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageScore: Math.round(avgScore * 10) / 10
      };
    });

    return {
      totalWorkers,
      totalForemen,
      ratingCounts,
      teamPerformance,
      performanceTrend,
      evaluatedWorkers
    };
  }, [filteredData, foremen, filters, evaluations]);

  const ratingData = [
    { name: 'A Rating', value: dashboardData.ratingCounts.A, color: '#22c55e' },
    { name: 'B Rating', value: dashboardData.ratingCounts.B, color: '#3b82f6' },
    { name: 'C Rating', value: dashboardData.ratingCounts.C, color: '#ef4444' }
  ];

  const handleCardClick = (cardType: string) => {
    // Navigate to different views based on card clicked
    switch (cardType) {
      case 'workers':
        navigate('/?tab=workers');
        break;
      case 'foremen':
        navigate('/?tab=foremen');
        break;
      case 'evaluations':
        navigate('/?tab=history');
        break;
      case 'a-ratings':
        navigate('/?tab=history');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Filters */}
      <DashboardFiltersComponent
        workers={workers}
        foremen={foremen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Overview Cards - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ClickableDashboardCard
          title="Total Workers"
          value={dashboardData.totalWorkers}
          icon={Users}
          iconColor="text-blue-600"
          onClick={() => handleCardClick('workers')}
        />

        <ClickableDashboardCard
          title="Total Foremen"
          value={dashboardData.totalForemen}
          icon={TrendingUp}
          iconColor="text-green-600"
          onClick={() => handleCardClick('foremen')}
        />

        <ClickableDashboardCard
          title="Evaluated Workers"
          value={dashboardData.evaluatedWorkers}
          icon={Award}
          iconColor="text-purple-600"
          onClick={() => handleCardClick('evaluations')}
        />

        <ClickableDashboardCard
          title="A Ratings"
          value={dashboardData.ratingCounts.A}
          icon={AlertTriangle}
          iconColor="text-yellow-600"
          onClick={() => handleCardClick('a-ratings')}
          className="text-green-600"
        />
      </div>

      {/* Performance Scatter Plot */}
      <PerformanceScatterPlot
        workers={filteredData}
        foremen={foremen}
        foremanFilter={filters.foremanId}
        workerFilter={filters.workerId}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution (Biweekly Evaluations)</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.evaluatedWorkers > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No evaluation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance by Foreman (Biweekly)</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.teamPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 33]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}/33`,
                      name === 'averageScore' ? 'Average Score' : name
                    ]}
                    labelFormatter={(label) => `Foreman: ${label}`}
                  />
                  <Bar dataKey="averageScore" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No foreman data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend (Last 12 Weeks - Biweekly)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 33]} />
              <Tooltip formatter={(value) => [`${value}/33`, 'Average Score']} />
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>A Ratings</span>
                <Badge variant="default">{dashboardData.ratingCounts.A}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>B Ratings</span>
                <Badge variant="secondary">{dashboardData.ratingCounts.B}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>C Ratings</span>
                <Badge variant="destructive">{dashboardData.ratingCounts.C}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Workers per Foreman</span>
                <span className="font-semibold">
                  {dashboardData.totalForemen > 0 
                    ? Math.round(dashboardData.totalWorkers / dashboardData.totalForemen * 10) / 10 
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Evaluation Rate</span>
                <span className="font-semibold">
                  {dashboardData.totalWorkers > 0 
                    ? Math.round((dashboardData.evaluatedWorkers / dashboardData.totalWorkers) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Evaluations</span>
                <span className="font-semibold">
                  {evaluations.filter(e => e.period === 'biweekly' && e.evaluateeType === 'worker').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Team Score</span>
                <span className="font-semibold">
                  {dashboardData.evaluatedWorkers > 0 
                    ? Math.round(
                        filteredData
                          .filter(w => getBiweeklyEvaluations(w.evaluations).length > 0)
                          .reduce((sum, worker) => {
                            const biweeklyEvals = getBiweeklyEvaluations(worker.evaluations);
                            const latest = biweeklyEvals[biweeklyEvals.length - 1];
                            return sum + latest.totalScore;
                          }, 0) / dashboardData.evaluatedWorkers * 10
                      ) / 10
                    : 0}/33
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
