
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, User, Search, X, Phone, Mail, UserCheck, FileText } from 'lucide-react';
import { Worker, Foreman } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/database';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [selectedForemanId, setSelectedForemanId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [foremanFilter, setForemanFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
  }, []);

  // Real-time subscription for workers table
  useEffect(() => {
    const channel = supabase
      .channel('workers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workers'
        },
        (payload) => {
          console.log('Workers table change detected:', payload);
          // Reload data when workers table changes
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersData, foremenData] = await Promise.all([
        dbService.getWorkers(),
        dbService.getForemen()
      ]);
      setWorkers(workersData);
      setForemen(foremenData);
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

  const addWorker = async () => {
    if (!newWorkerName.trim() || !selectedForemanId) {
      toast({
        title: "Error",
        description: "Please enter a worker name and select a foreman",
        variant: "destructive"
      });
      return;
    }

    try {
      const newWorker = await dbService.createWorker({
        name: newWorkerName.trim(),
        foremanId: selectedForemanId
      });

      setWorkers(prev => [...prev, newWorker]);
      setNewWorkerName('');
      setSelectedForemanId('');
      
      toast({
        title: "Success",
        description: "Worker added successfully"
      });
    } catch (error) {
      console.error('Error creating worker:', error);
      toast({
        title: "Error",
        description: "Failed to create worker",
        variant: "destructive"
      });
    }
  };

  const deleteWorker = async (workerId: string) => {
    try {
      await dbService.deleteWorker(workerId);
      setWorkers(prev => prev.filter(worker => worker.id !== workerId));
      toast({
        title: "Success",
        description: "Worker deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast({
        title: "Error",
        description: "Failed to delete worker",
        variant: "destructive"
      });
    }
  };

  const getForemanName = (foremanId: string) => {
    const foreman = foremen.find(f => f.id === foremanId);
    return foreman?.name || 'Unknown Foreman';
  };

  const getWorkerLatestRating = (worker: Worker) => {
    if (worker.evaluations.length === 0) return null;
    const latest = worker.evaluations[worker.evaluations.length - 1];
    return latest.rating;
  };

  // Filter workers based on search term and foreman filter
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getForemanName(worker.foremanId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesForeman = !foremanFilter || foremanFilter === 'all-foremen' || worker.foremanId === foremanFilter;
    
    return matchesSearch && matchesForeman;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setForemanFilter('');
  };

  const hasActiveFilters = searchTerm || (foremanFilter && foremanFilter !== 'all-foremen');

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading workers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-0 bg-gradient-to-r from-card/50 to-background/30 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <div className="p-2 rounded-xl bg-primary/10">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            Add New Worker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className="space-y-2">
              <Label htmlFor="workerName" className="text-sm font-medium">Worker Name</Label>
              <Input
                id="workerName"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                placeholder="Enter worker name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foreman" className="text-sm font-medium">Assign Foreman</Label>
              <Select value={selectedForemanId} onValueChange={setSelectedForemanId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a foreman" />
                </SelectTrigger>
                <SelectContent>
                  {foremen.map(foreman => (
                    <SelectItem key={foreman.id} value={foreman.id}>
                      {foreman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={`flex items-end ${isMobile ? 'mt-2' : ''}`}>
              <Button 
                onClick={addWorker} 
                className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                size={isMobile ? "lg" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card className="border-0 bg-gradient-to-r from-background/30 to-card/50 backdrop-blur-sm shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-xl bg-accent/10">
              <Search className="w-5 h-5 text-accent" />
            </div>
            Filter Workers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-background/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="foremanFilter" className="text-sm font-medium">Filter by Foreman</Label>
              <Select value={foremanFilter || 'all-foremen'} onValueChange={setForemanFilter}>
                <SelectTrigger className="h-11 bg-background/50">
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

            {hasActiveFilters && (
              <div className={`flex items-end ${isMobile ? 'mt-2' : ''}`}>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full h-11 flex items-center gap-2 border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-muted">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Showing {filteredWorkers.length} of {workers.length} workers</span>
                {foremanFilter && foremanFilter !== 'all-foremen' && (
                  <Badge variant="secondary" className="shadow-sm">
                    Foreman: {getForemanName(foremanFilter)}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="shadow-sm">
                    Search: "{searchTerm}"
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {filteredWorkers.map(worker => {
          const latestRating = getWorkerLatestRating(worker);
          return (
            <Card 
              key={worker.id} 
              className="group hover:shadow-xl transition-all duration-300 ease-out border-0 bg-gradient-to-br from-card/80 to-background/40 backdrop-blur-sm hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">{worker.name}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "icon"}
                    onClick={() => deleteWorker(worker.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors group-hover:opacity-100 opacity-70"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">Foreman:</span>{' '}
                      <span className="text-muted-foreground">{getForemanName(worker.foremanId)}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">Evaluations:</span>{' '}
                      <span className="text-muted-foreground">{worker.evaluations.length}</span>
                    </span>
                  </div>
                  
                  {latestRating && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium text-foreground">Latest Rating:</span>
                      <Badge 
                        variant={
                          latestRating === 'A' ? 'default' :
                          latestRating === 'B' ? 'secondary' : 'destructive'
                        }
                        className="shadow-sm"
                      >
                        {latestRating}
                      </Badge>
                    </div>
                  )}
                  
                  {!latestRating && (
                    <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                      <span className="text-sm text-warning font-medium">No evaluations yet</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredWorkers.length === 0 && workers.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {workers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workers yet</h3>
            <p className="text-gray-500">Add your first worker to get started with evaluations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkerManagement;
