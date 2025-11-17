
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-bg px-4 py-8">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="card-elevated glass-card border-0">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-float">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Please contact the administrator to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  For security reasons, password resets require administrator approval. Please contact the administrator through the following methods:
                </p>
              </div>
              
              <div className="space-y-4 stagger-animation">
                <div className="group flex items-center gap-4 p-4 bg-gradient-glass backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-md hover:-translate-y-1 transition-all duration-normal">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-normal">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">lukelu37217@gmail.com</p>
                  </div>
                </div>
                
                <div className="group flex items-center gap-4 p-4 bg-gradient-glass backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-md hover:-translate-y-1 transition-all duration-normal">
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-accent transition-all duration-normal">
                    <Phone className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-sm text-muted-foreground">Contact your direct supervisor</p>
                  </div>
                </div>
                
                <div className="group flex items-center gap-4 p-4 bg-gradient-glass backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-md hover:-translate-y-1 transition-all duration-normal">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-normal">
                    <MessageCircle className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">IT Support</p>
                    <p className="text-sm text-muted-foreground">Contact IT specialist via email</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="glass" 
              onClick={onBackToLogin} 
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
