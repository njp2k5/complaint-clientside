import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, MessageSquare } from 'lucide-react';

const LoginSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-purple">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            ComplaintHub
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamlined complaint management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Student Portal</CardTitle>
              <CardDescription>
                Submit and track your complaints with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="gradient" 
                className="w-full" 
                onClick={() => navigate('/student/login')}
              >
                Login as Student
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
              <CardDescription>
                Manage complaints and generate reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="glow" 
                className="w-full" 
                onClick={() => navigate('/admin/login')}
              >
                Login as Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;