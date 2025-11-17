import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, User, Shield, Users, Crown, CheckCircle, Clock, X, Database, TreePine } from 'lucide-react';
import { User as UserType, Foreman, Manager, Leader } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/services/database';
import UserDataViewer from './UserDataViewer';
import TeamHierarchyManagement from './TeamHierarchyManagement';

const UserManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'leader' | 'manager' | 'foreman'>('foreman');
  const [newUserEntityId, setNewUserEntityId] = useState('');
  
  // State for approval selections
  const [approvalSelections, setApprovalSelections] = useState<{[userId: string]: {role: string, entityId: string}}>({});
  
  const { toast } = useToast();
  const { user: currentUser, refreshUsers } = useAuth();

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, foremenData, managersData, leadersData] = await Promise.all([
          dbService.getUsers(),
          dbService.getForemen(),
          dbService.getManagers(),
          dbService.getLeaders()
        ]);
        
        setUsers(usersData);
        setForemen(foremenData);
        setManagers(managersData);
        setLeaders(leadersData);
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

    loadData();
  }, [toast]);

  // Get pending users
  const pendingUsers = users.filter(u => u.isPending && !u.isActive);
  const activeUsers = users.filter(u => !u.isPending || u.isActive);

  const getEntitiesForRole = (role: string) => {
    switch (role) {
      case 'foreman':
        return foremen.map(f => ({ id: f.id, name: f.name }));
      case 'manager':
        return managers.map(m => ({ id: m.id, name: m.name }));
      case 'leader':
        return leaders.map(l => ({ id: l.id, name: l.name }));
      default:
        return [];
    }
  };

  const approveUser = async (userId: string) => {
    const selection = approvalSelections[userId];
    if (!selection || !selection.role) {
      toast({
        title: "Error",
        description: "Please select a role first",
        variant: "destructive"
      });
      return;
    }

    if (selection.role !== 'admin' && (!selection.entityId || selection.entityId === 'none')) {
      toast({
        title: "Error", 
        description: "Please select an entity for this role",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Approving user with selection:', selection);
      const entityId = selection.role === 'admin' || selection.entityId === 'none' ? '' : selection.entityId;

      const updatedUser = await dbService.updateUser(userId, {
        role: selection.role as any,
        entityId,
        isActive: true,
        isPending: false,
        status: 'approved'
      });

      console.log('✅ User approved successfully:', updatedUser);

      // Refresh users list from database
      const updatedUsers = await dbService.getUsers();
      setUsers(updatedUsers);
      
      // Also refresh the auth context
      refreshUsers();
      
      // Clear the selection
      setApprovalSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[userId];
        return newSelections;
      });
      
      toast({
        title: "User Approved",
        description: "User status updated in database and can now log into the system"
      });
    } catch (error) {
      console.error('❌ Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user in database",
        variant: "destructive"
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      await dbService.deleteUser(userId);
      
      // Refresh users list
      const updatedUsers = await dbService.getUsers();
      setUsers(updatedUsers);
      
      // Clear the selection
      setApprovalSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[userId];
        return newSelections;
      });
      
      toast({
        title: "User Registration Rejected",
        description: "User registration has been rejected"
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    setApprovalSelections(prev => ({
      ...prev,
      [userId]: { role, entityId: 'none' }
    }));
  };

  const handleEntityChange = (userId: string, entityId: string) => {
    setApprovalSelections(prev => ({
      ...prev,
      [userId]: { ...prev[userId], entityId }
    }));
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await dbService.updateUser(userId, { isActive: !user.isActive });
      
      // Refresh users list
      const updatedUsers = await dbService.getUsers();
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User status updated"
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive"
      });
      return;
    }

    try {
      await dbService.deleteUser(userId);
      
      // Refresh users list
      const updatedUsers = await dbService.getUsers();
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const getEntityName = (user: UserType) => {
    switch (user.role) {
      case 'foreman':
        return foremen.find(f => f.id === user.entityId)?.name || 'Unknown';
      case 'manager':
        return managers.find(m => m.id === user.entityId)?.name || 'Unknown';
      case 'leader':
        return leaders.find(l => l.id === user.entityId)?.name || 'Unknown';
      default:
        return 'System';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'leader': return <Crown className="w-4 h-4" />;
      case 'manager': return <Users className="w-4 h-4" />;
      case 'foreman': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'leader': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'foreman': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'leader': return 'Leader';
      case 'manager': return 'Manager';
      case 'foreman': return 'Foreman';
      default: return role;
    }
  };

  // Only show to admins
  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only administrators can manage users.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="hierarchy">Team Hierarchy</TabsTrigger>
          <TabsTrigger value="data">Data Inspector</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Pending Users Section */}
          {pendingUsers.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Clock className="w-5 h-5" />
                  Pending User Approvals ({pendingUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingUsers.map(user => {
                    const selection = approvalSelections[user.id] || { role: '', entityId: 'none' };
                    const availableEntities = getEntitiesForRole(selection.role);
                    
                    return (
                      <Card key={user.id} className="bg-white border-orange-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <User className="w-4 h-4" />
                              {user.name}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Pending
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm text-gray-600">
                            <strong>Email:</strong> {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            Registered: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label>Assign Role:</Label>
                              <Select onValueChange={(role) => handleRoleChange(user.id, role)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="leader">Leader</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="foreman">Foreman</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {selection.role && selection.role !== 'admin' && (
                              <div>
                                <Label>Assign to {getRoleDisplayName(selection.role)}:</Label>
                                <Select onValueChange={(entityId) => handleEntityChange(user.id, entityId)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${selection.role}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No {selection.role}</SelectItem>
                                    {availableEntities.map(entity => (
                                      <SelectItem key={entity.id} value={entity.id}>
                                        {entity.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approveUser(user.id)}
                                className="flex-1"
                                disabled={!selection.role || (selection.role !== 'admin' && (!selection.entityId || selection.entityId === 'none'))}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => rejectUser(user.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Users Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                System Users ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeUsers.map(user => (
                  <Card key={user.id} className={`hover:shadow-lg transition-shadow ${!user.isActive ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getRoleIcon(user.role)}
                          {user.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                            disabled={user.id === currentUser?.id}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>Email:</strong> {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                          {!user.isActive && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {user.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Entity:</strong> {getEntityName(user)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {activeUsers.length === 0 && pendingUsers.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-500">Users will appear here after registration for approval.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hierarchy">
          <TeamHierarchyManagement />
        </TabsContent>

        <TabsContent value="data">
          <UserDataViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
