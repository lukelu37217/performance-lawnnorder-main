
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, User, Key, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const UserDataViewer = () => {
  const [users, setUsers] = useLocalStorage<UserType[]>('users', []);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  const selectedUser = users.find(u => u.id === selectedUserId);

  const resetPassword = () => {
    if (!selectedUser || !newPassword) {
      toast({
        title: "Error",
        description: "Please select a user and enter a new password",
        variant: "destructive"
      });
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === selectedUserId 
        ? { ...user, password: newPassword }
        : user
    ));

    setNewPassword('');
    toast({
      title: "Success",
      description: `Password updated for ${selectedUser.name}`
    });
  };

  const toggleUserStatus = (field: 'isActive' | 'isPending') => {
    if (!selectedUser) return;

    setUsers(prev => prev.map(user => 
      user.id === selectedUserId 
        ? { ...user, [field]: !user[field] }
        : user
    ));

    toast({
      title: "Success",
      description: `User ${field} status updated`
    });
  };

  const refreshData = () => {
    // Force a re-read from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    toast({
      title: "Data Refreshed",
      description: "User data has been reloaded from storage"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            User Data Inspector
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">User Details</TabsTrigger>
              <TabsTrigger value="tools">Admin Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {user.isPending && <Badge variant="secondary">Pending</Badge>}
                          {!user.isActive && <Badge variant="destructive">Inactive</Badge>}
                          {user.isActive && !user.isPending && <Badge variant="default">Active</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Role:</strong> {user.role}</div>
                      <div><strong>Password:</strong> {user.password}</div>
                      <div><strong>Entity ID:</strong> {user.entityId || 'N/A'}</div>
                      <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label>Select User</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedUser.name} - Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>ID:</strong> {selectedUser.id}</div>
                      <div><strong>Email:</strong> {selectedUser.email}</div>
                      <div><strong>Password:</strong> {selectedUser.password}</div>
                      <div><strong>Role:</strong> {selectedUser.role}</div>
                      <div><strong>Entity ID:</strong> {selectedUser.entityId || 'N/A'}</div>
                      <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Is Active</Label>
                        <Switch
                          checked={selectedUser.isActive}
                          onCheckedChange={() => toggleUserStatus('isActive')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Is Pending</Label>
                        <Switch
                          checked={selectedUser.isPending}
                          onCheckedChange={() => toggleUserStatus('isPending')}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-md">
                      <pre className="text-xs">{JSON.stringify(selectedUser, null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Password Reset for {selectedUser.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Current Password</Label>
                      <Input value={selectedUser.password} disabled />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <Button onClick={resetPassword} disabled={!newPassword}>
                      Reset Password
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Raw Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-auto">
                    <pre className="text-xs">{JSON.stringify(users, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDataViewer;
