import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import CompanyLogo from './CompanyLogo';
import { registrationSchema } from '@/lib/validationSchemas';

interface RegistrationFormProps {
  onBackToLogin: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    const validation = registrationSchema.safeParse({ name, email, password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name);

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Account Created Successfully!",
        description: "Please check your email to verify your account before logging in.",
      });

      setIsSuccess(true);
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <Card className="w-full max-w-md glass-card backdrop-blur-md border-0 shadow-2xl relative z-10">
          <CardHeader className="text-center space-y-4">
            <CompanyLogo size="md" />
            <div className="w-16 h-16 bg-gradient-nature rounded-full flex items-center justify-center mx-auto shadow-glow">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-nature bg-clip-text text-transparent">
              Welcome to Lawn 'N' Order!
            </CardTitle>
            <CardDescription>
              Your registration is complete and pending administrator approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                You will receive access once an administrator approves your account. This usually takes 1-2 business days.
              </AlertDescription>
            </Alert>
            <Button onClick={onBackToLogin} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-nature rounded-full opacity-10 blur-xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-earth rounded-full opacity-10 blur-xl" />
      
      <Card className="w-full max-w-md glass-card backdrop-blur-md border-0 shadow-2xl relative z-10">
        <CardHeader className="space-y-4 text-center">
          <CompanyLogo size="md" />
          <CardTitle className="text-2xl font-bold bg-gradient-nature bg-clip-text text-transparent flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6 text-accent" />
            Join Our Team
          </CardTitle>
          <CardDescription className="text-center">
            Register for access to the Lawn 'N' Order Performance System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                All email addresses will be automatically converted to lowercase.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={onBackToLogin}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
