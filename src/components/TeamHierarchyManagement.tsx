
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Building, UserCheck, User, Users, ArrowRight, TreePine } from 'lucide-react';
import { Leader, Manager, Foreman, Worker } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/database';
import { supabase } from '@/integrations/supabase/client';
import ManagerManagement from './ManagerManagement';
import LeaderManagement from './LeaderManagement';
import ForemanManagement from './ForemanManagement';
import WorkerManagement from './WorkerManagement';

const TeamHierarchyManagement = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only allow admins to access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <TreePine className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only administrators can manage team hierarchy.</p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  // Real-time subscription for workers table changes
  useEffect(() => {
    const channel = supabase
      .channel('team-hierarchy-workers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workers'
        },
        (payload) => {
          console.log('TeamHierarchy - Workers table change detected:', payload);
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
      const [leadersData, managersData, foremenData, workersData] = await Promise.all([
        dbService.getLeaders(),
        dbService.getManagers(),
        dbService.getForemen(),
        dbService.getWorkers()
      ]);
      setLeaders(leadersData);
      setManagers(managersData);
      setForemen(foremenData);
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

  const reassignManager = async (managerId: string, newLeaderId: string) => {
    try {
      const updatedManager = await dbService.updateManager(managerId, {
        leaderId: newLeaderId === 'none' ? undefined : newLeaderId || undefined
      });
      
      setManagers(prev => prev.map(manager => 
        manager.id === managerId ? updatedManager : manager
      ));
      
      toast({
        title: "Success",
        description: "Manager reassigned successfully"
      });
    } catch (error) {
      console.error('Error reassigning manager:', error);
      toast({
        title: "Error",
        description: "Failed to reassign manager",
        variant: "destructive"
      });
    }
  };

  const reassignForeman = async (foremanId: string, newManagerId: string) => {
    try {
      const updatedForeman = await dbService.updateForeman(foremanId, {
        managerId: newManagerId === 'none' ? null : newManagerId || undefined
      });
      
      setForemen(prev => prev.map(foreman => 
        foreman.id === foremanId ? updatedForeman : foreman
      ));
      
      toast({
        title: "Success", 
        description: "Foreman reassigned successfully"
      });
    } catch (error) {
      console.error('Error reassigning foreman:', error);
      toast({
        title: "Error",
        description: "Failed to reassign foreman",
        variant: "destructive"
      });
    }
  };

  const reassignWorker = async (workerId: string, newForemanId: string) => {
    try {
      const updatedWorker = await dbService.updateWorker(workerId, {
        foremanId: newForemanId
      });
      
      setWorkers(prev => prev.map(worker => 
        worker.id === workerId ? updatedWorker : worker
      ));
      
      toast({
        title: "Success",
        description: "Worker reassigned successfully"
      });
    } catch (error) {
      console.error('Error reassigning worker:', error);
      toast({
        title: "Error",
        description: "Failed to reassign worker",
        variant: "destructive"
      });
    }
  };

  const getLeaderName = (leaderId?: string) => {
    if (!leaderId) return 'No Leader Assigned';
    return leaders.find(l => l.id === leaderId)?.name || 'Unknown';
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'No Manager Assigned';
    return managers.find(m => m.id === managerId)?.name || 'Unknown';
  };

  const renderHierarchyTree = () => (
    <div className="space-y-6">
      {leaders.map(leader => {
        const leaderManagers = managers.filter(m => m.leaderId === leader.id);
        const directForemen = foremen.filter(f => !f.managerId); // Brian's direct foremen
        const isBrian = leader.name === 'Brian';
        
        return (
          <Card key={leader.id} className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Crown className="w-5 h-5" />
                {leader.name} (Leader)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Brian's direct foremen (no managers) */}
                {isBrian && directForemen.map(foreman => {
                  const foremanWorkers = workers.filter(w => w.foremanId === foreman.id);
                  
                  return (
                    <Card key={foreman.id} className="border border-green-200 ml-4">
                      <CardHeader className="bg-green-50 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <UserCheck className="w-4 h-4" />
                            <span className="font-medium text-green-800">{foreman.name} (Foreman)</span>
                          </div>
                          <Select onValueChange={(value) => reassignForeman(foreman.id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Reassign" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Manager (Reports to Brian)</SelectItem>
                              {managers.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {foremanWorkers.map(worker => (
                            <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                <User className="w-3 h-3" />
                                <span className="text-sm">{worker.name}</span>
                              </div>
                              <Select onValueChange={(value) => reassignWorker(worker.id, value)}>
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue placeholder="Move" />
                                </SelectTrigger>
                                <SelectContent>
                                  {foremen.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Dylan's managers */}
                {leaderManagers.map(manager => {
                  const managerForemen = foremen.filter(f => f.managerId === manager.id);
                  
                  return (
                    <Card key={manager.id} className="border border-blue-200 ml-4">
                      <CardHeader className="bg-blue-50 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <Building className="w-4 h-4" />
                            <span className="font-medium text-blue-800">{manager.name} (Manager)</span>
                          </div>
                          <Select onValueChange={(value) => reassignManager(manager.id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Reassign" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Leader</SelectItem>
                              {leaders.map(l => (
                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3">
                        {managerForemen.map(foreman => {
                          const foremanWorkers = workers.filter(w => w.foremanId === foreman.id);
                          
                          return (
                            <Card key={foreman.id} className="border border-green-200 ml-4 mb-3">
                              <CardHeader className="bg-green-50 pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <UserCheck className="w-4 h-4" />
                                    <span className="font-medium text-green-800">{foreman.name} (Foreman)</span>
                                  </div>
                                  <Select onValueChange={(value) => reassignForeman(foreman.id, value)}>
                                    <SelectTrigger className="w-40">
                                      <SelectValue placeholder="Reassign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Manager (Reports to Brian)</SelectItem>
                                      {managers.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {foremanWorkers.map(worker => (
                                    <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex items-center gap-2">
                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                        <User className="w-3 h-3" />
                                        <span className="text-sm">{worker.name}</span>
                                      </div>
                                      <Select onValueChange={(value) => reassignWorker(worker.id, value)}>
                                        <SelectTrigger className="w-32 h-8">
                                          <SelectValue placeholder="Move" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {foremen.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Unassigned entities */}
      {managers.filter(m => !m.leaderId).length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-gray-600">Unassigned Managers</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {managers.filter(m => !m.leaderId).map(manager => (
              <div key={manager.id} className="flex items-center justify-between p-2 border rounded mb-2">
                <span>{manager.name}</span>
                <Select onValueChange={(value) => reassignManager(manager.id, value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assign to Leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading team hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hierarchy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hierarchy">Team Hierarchy</TabsTrigger>
          <TabsTrigger value="leaders">Leaders</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="foremen">Foremen</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Team Hierarchy Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Hierarchy Structure:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• <Crown className="w-4 h-4 inline mr-1" /> Brian: Directly manages 4 foremen (Max, Dusty, Rana, Lucas)</div>
                  <div>• <Crown className="w-4 h-4 inline mr-1" /> Dylan: Manages 2 managers (Trevor, Brodie)</div>
                  <div>• <Building className="w-4 h-4 inline mr-1" /> Trevor: Manages foreman Daria</div>
                  <div>• <Building className="w-4 h-4 inline mr-1" /> Brodie: Manages foreman Brodie</div>
                  <div>• <UserCheck className="w-4 h-4 inline mr-1" /> Foremen lead worker teams</div>
                </div>
              </div>
              {renderHierarchyTree()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaders">
          <LeaderManagement />
        </TabsContent>

        <TabsContent value="managers">
          <ManagerManagement />
        </TabsContent>

        <TabsContent value="foremen">
          <ForemanManagement />
        </TabsContent>

        <TabsContent value="workers">
          <WorkerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamHierarchyManagement;
