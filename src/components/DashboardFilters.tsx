
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Worker, Foreman, DashboardFilters } from '@/types';

interface DashboardFiltersProps {
  workers: Worker[];
  foremen: Foreman[];
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

const DashboardFiltersComponent = ({ 
  workers, 
  foremen, 
  filters, 
  onFiltersChange 
}: DashboardFiltersProps) => {
  const clearFilters = () => {
    onFiltersChange({});
  };

  const filteredWorkers = filters.foremanId 
    ? workers.filter(w => w.foremanId === filters.foremanId)
    : workers;

  const hasActiveFilters = filters.foremanId || filters.workerId;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <Label htmlFor="foreman-filter">Filter by Foreman</Label>
            <Select 
              value={filters.foremanId || 'all-foremen'} 
              onValueChange={(value) => onFiltersChange({ 
                ...filters, 
                foremanId: value === 'all-foremen' ? undefined : value,
                workerId: undefined // Clear worker filter when foreman changes
              })}
            >
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

          <div className="min-w-[200px]">
            <Label htmlFor="worker-filter">Filter by Worker</Label>
            <Select 
              value={filters.workerId || 'all-workers'} 
              onValueChange={(value) => onFiltersChange({ 
                ...filters, 
                workerId: value === 'all-workers' ? undefined : value 
              })}
              disabled={filteredWorkers.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Workers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-workers">All Workers</SelectItem>
                {filteredWorkers.map(worker => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-3 text-sm text-gray-600">
            Active filters: 
            {filters.foremanId && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Foreman: {foremen.find(f => f.id === filters.foremanId)?.name}
              </span>
            )}
            {filters.workerId && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                Worker: {workers.find(w => w.id === filters.workerId)?.name}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardFiltersComponent;
