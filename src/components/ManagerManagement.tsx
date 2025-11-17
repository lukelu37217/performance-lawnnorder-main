
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Users, Building } from 'lucide-react';
import { Manager, Leader, Foreman } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/database';

const ManagerManagement = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [newManagerName, setNewManagerName] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only allow admins to access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only administrators can manage managers.</p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [managersData, leadersData, foremenData] = await Promise.all([
        dbService.getManagers(),
        dbService.getLeaders(),
        dbService.getForemen()
      ]);
      setManagers(managersData);
      setLeaders(leadersData);
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

  const addManager = async () => {
    if (!newManagerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a manager name",
        variant: "destructive"
      });
      return;
    }

    try {
      const newManager = await dbService.createManager({
        name: newManagerName.trim(),
        leaderId: selectedLeaderId === 'none' ? undefined : selectedLeaderId || undefined
      });

      setManagers(prev => [...prev, newManager]);
      setNewManagerName('');
      setSelectedLeaderId('');
      
      toast({
        title: "Success",
        description: "Manager added successfully"
      });
    } catch (error) {
      console.error('Error creating manager:', error);
      toast({
        title: "Error",
        description: "Failed to create manager",
        variant: "destructive"
      });
    }
  };

  const deleteManager = async (managerId: string) => {
    const assignedForemen = foremen.filter(foreman => foreman.managerId === managerId);
    
    if (assignedForemen.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This manager has assigned foremen. Please reassign them first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await dbService.deleteManager(managerId);
      setManagers(prev => prev.filter(manager => manager.id !== managerId));
      toast({
        title: "Success",
        description: "Manager deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting manager:', error);
      toast({
        title: "Error",
        description: "Failed to delete manager",
        variant: "destructive"
      });
    }
  };

  const getTeamSize = (managerId: string) => {
    return foremen.filter(foreman => foreman.managerId === managerId).length;
  };

  const getLeaderName = (leaderId?: string) => {
    if (!leaderId) return 'No leader assigned';
    const leader = leaders.find(l => l.id === leaderId);
    return leader?.name || 'Unknown Leader';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading managers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="managerName">Manager Name</Label>
              <Input
                id="managerName"
                value={newManagerName}
                onChange={(e) => setNewManagerName(e.target.value)}
                placeholder="Enter manager name"
              />
            </div>
            <div>
              <Label htmlFor="leader">Assign to Leader (Optional)</Label>
              <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No leader</SelectItem>
                  {leaders.map(leader => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addManager} className="w-full">
                Add Manager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managers.map(manager => {
          const teamSize = getTeamSize(manager.id);
          
          return (
            <Card key={manager.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5" />
                    {manager.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteManager(manager.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Foremen: <strong>{teamSize}</strong>
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Reports to:</strong> {getLeaderName(manager.leaderId)}
                  </div>
                  
                  {teamSize === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      No foremen assigned
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {managers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No managers yet</h3>
            <p className="text-gray-500">Add your first manager to start organizing your teams.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManagerManagement;
