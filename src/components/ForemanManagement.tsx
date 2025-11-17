
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, UserCheck, Users, Star, TrendingUp } from 'lucide-react';
import { Worker, Foreman, Manager } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/services/database';
import { useIsMobile } from '@/hooks/use-mobile';

const ForemanManagement = () => {
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newForemanName, setNewForemanName] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foremenData, managersData, workersData] = await Promise.all([
        dbService.getForemen(),
        dbService.getManagers(),
        dbService.getWorkers()
      ]);
      setForemen(foremenData);
      setManagers(managersData);
      setWorkers(workersData);
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

  const addForeman = async () => {
    if (!newForemanName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a foreman name",
        variant: "destructive"
      });
      return;
    }

    try {
      const newForeman = await dbService.createForeman({
        name: newForemanName.trim(),
        managerId: selectedManagerId === 'none' ? undefined : selectedManagerId || undefined
      });

      setForemen(prev => [...prev, newForeman]);
      setNewForemanName('');
      setSelectedManagerId('');
      
      toast({
        title: "Success",
        description: "Foreman added successfully"
      });
    } catch (error) {
      console.error('Error creating foreman:', error);
      toast({
        title: "Error",
        description: "Failed to create foreman",
        variant: "destructive"
      });
    }
  };

  const deleteForeman = async (foremanId: string) => {
    const assignedWorkers = workers.filter(worker => worker.foremanId === foremanId);
    
    if (assignedWorkers.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This foreman has assigned workers. Please reassign them first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await dbService.deleteForeman(foremanId);
      setForemen(prev => prev.filter(foreman => foreman.id !== foremanId));
      toast({
        title: "Success",
        description: "Foreman deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting foreman:', error);
      toast({
        title: "Error",
        description: "Failed to delete foreman",
        variant: "destructive"
      });
    }
  };

  const getTeamSize = (foremanId: string) => {
    return workers.filter(worker => worker.foremanId === foremanId).length;
  };

  const getTeamAverageRating = (foremanId: string) => {
    const teamWorkers = workers.filter(worker => worker.foremanId === foremanId);
    if (teamWorkers.length === 0) return null;

    const ratingsWithEvaluations = teamWorkers
      .filter(worker => worker.evaluations.length > 0)
      .map(worker => worker.evaluations[worker.evaluations.length - 1].rating);

    if (ratingsWithEvaluations.length === 0) return null;

    const ratingValues = ratingsWithEvaluations.map(rating => 
      rating === 'A' ? 3 : rating === 'B' ? 2 : 1
    );

    const average = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;
    
    if (average >= 2.5) return 'A';
    if (average >= 1.5) return 'B';
    return 'C';
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No manager assigned';
    return managers.find(m => m.id === managerId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading foremen...</p>
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
            Add New Foreman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className="space-y-2">
              <Label htmlFor="foremanName" className="text-sm font-medium">Foreman Name</Label>
              <Input
                id="foremanName"
                value={newForemanName}
                onChange={(e) => setNewForemanName(e.target.value)}
                placeholder="Enter foreman name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager" className="text-sm font-medium">Assign to Manager (Optional)</Label>
              <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No manager</SelectItem>
                  {managers.map(manager => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={`flex items-end ${isMobile ? 'mt-2' : ''}`}>
              <Button 
                onClick={addForeman} 
                className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                size={isMobile ? "lg" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Foreman
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {foremen.map(foreman => {
          const teamSize = getTeamSize(foreman.id);
          const avgRating = getTeamAverageRating(foreman.id);
          
          return (
            <Card 
              key={foreman.id} 
              className="group hover:shadow-xl transition-all duration-300 ease-out border-0 bg-gradient-to-br from-card/80 to-background/40 backdrop-blur-sm hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <UserCheck className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold">{foreman.name}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "icon"}
                    onClick={() => deleteForeman(foreman.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors group-hover:opacity-100 opacity-70"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">Team Size:</span>{' '}
                      <span className="text-muted-foreground font-semibold">{teamSize}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">Reports to:</span>{' '}
                      <span className="text-muted-foreground">{getManagerName(foreman.managerId)}</span>
                    </span>
                  </div>
                  
                  {avgRating && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Team Avg Rating:</span>
                      </div>
                      <Badge 
                        variant={
                          avgRating === 'A' ? 'default' :
                          avgRating === 'B' ? 'secondary' : 'destructive'
                        }
                        className="shadow-sm"
                      >
                        {avgRating}
                      </Badge>
                    </div>
                  )}
                  
                  {teamSize === 0 && (
                    <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                      <span className="text-sm text-warning font-medium">No workers assigned</span>
                    </div>
                  )}
                  
                  {teamSize > 0 && !avgRating && (
                    <div className="p-2 rounded-lg bg-info/10 border border-info/20">
                      <span className="text-sm text-muted-foreground">Team needs evaluation</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {foremen.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No foremen yet</h3>
            <p className="text-gray-500">Add your first foreman to start organizing your teams.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForemanManagement;
