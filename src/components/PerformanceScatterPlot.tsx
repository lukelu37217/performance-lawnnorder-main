
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Worker, Foreman } from '@/types';
import { generateScatterPlotData } from '@/utils/biweeklyUtils';

interface PerformanceScatterPlotProps {
  workers: Worker[];
  foremen: Foreman[];
  foremanFilter?: string;
  workerFilter?: string;
}

const PerformanceScatterPlot = ({ 
  workers, 
  foremen, 
  foremanFilter, 
  workerFilter 
}: PerformanceScatterPlotProps) => {
  const allData = generateScatterPlotData(workers, foremen);
  
  // Apply filters
  let filteredData = allData;
  if (foremanFilter) {
    const foreman = foremen.find(f => f.id === foremanFilter);
    if (foreman) {
      filteredData = filteredData.filter(d => d.foremanName === foreman.name);
    }
  }
  if (workerFilter) {
    filteredData = filteredData.filter(d => d.workerId === workerFilter);
  }

  const getColorByRating = (rating: 'A' | 'B' | 'C') => {
    switch (rating) {
      case 'A': return '#22c55e';
      case 'B': return '#3b82f6';
      case 'C': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.workerName}</p>
          <p className="text-sm text-gray-600">Foreman: {data.foremanName}</p>
          <p className="text-sm text-gray-600">Date: {data.date}</p>
          <p className="text-sm">Score: {data.score}/33</p>
          <p className="text-sm">Rating: <span className={`font-bold ${
            data.rating === 'A' ? 'text-green-600' : 
            data.rating === 'B' ? 'text-blue-600' : 'text-red-600'
          }`}>{data.rating}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biweekly Performance Scatter Plot</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                type="category"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                dataKey="score" 
                type="number" 
                domain={[0, 33]}
                label={{ value: 'Total Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="score">
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorByRating(entry.rating)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No biweekly evaluation data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceScatterPlot;
