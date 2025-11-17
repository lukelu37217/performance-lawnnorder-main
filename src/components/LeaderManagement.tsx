
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Crown, Users } from 'lucide-react';
import { Leader, Manager } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/database';

const LeaderManagement = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [newLeaderName, setNewLeaderName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only allow admins to access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only administrators can manage leaders.</p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadersData, managersData] = await Promise.all([
        dbService.getLeaders(),
        dbService.getManagers()
      ]);
      setLeaders(leadersData);
      setManagers(managersData);
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

  const addLeader = async () => {
    if (!newLeaderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a leader name",
        variant: "destructive"
      });
      return;
    }

    try {
      const newLeader = await dbService.createLeader({
        name: newLeaderName.trim()
      });

      setLeaders(prev => [...prev, newLeader]);
      setNewLeaderName('');
      
      toast({
        title: "Success",
        description: "Leader added successfully"
      });
    } catch (error) {
      console.error('Error creating leader:', error);
      toast({
        title: "Error",
        description: "Failed to create leader",
        variant: "destructive"
      });
    }
  };

  const deleteLeader = async (leaderId: string) => {
    const assignedManagers = managers.filter(manager => manager.leaderId === leaderId);
    
    if (assignedManagers.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This leader has assigned managers. Please reassign them first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await dbService.deleteLeader(leaderId);
      setLeaders(prev => prev.filter(leader => leader.id !== leaderId));
      toast({
        title: "Success",
        description: "Leader deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting leader:', error);
      toast({
        title: "Error",
        description: "Failed to delete leader",
        variant: "destructive"
      });
    }
  };

  const getTeamSize = (leaderId: string) => {
    return managers.filter(manager => manager.leaderId === leaderId).length;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading leaders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leaderName">Leader Name</Label>
              <Input
                id="leaderName"
                value={newLeaderName}
                onChange={(e) => setNewLeaderName(e.target.value)}
                placeholder="Enter leader name"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addLeader} className="w-full">
                Add Leader
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaders.map(leader => {
          const teamSize = getTeamSize(leader.id);
          
          return (
            <Card key={leader.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="w-5 h-5" />
                    {leader.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLeader(leader.id)}
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
                      Managers: <strong>{teamSize}</strong>
                    </span>
                  </div>
                  
                  {teamSize === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      No managers assigned
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leaders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leaders yet</h3>
            <p className="text-gray-500">Add your first leader to start organizing your teams.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaderManagement;
