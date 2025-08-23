import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/enhanced-button';
import { LogOut, User, Shield } from 'lucide-react';

interface LayoutProps {
  userType?: 'student' | 'admin';
  userName?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ userType, userName, children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/');
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-card shadow-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              {userType === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ComplaintHub
              </h1>
              <p className="text-sm text-muted-foreground capitalize">{userType} Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};