import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Clock, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS } from '@/config';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  heading: string;
  description: string;
  status: string;
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const MyComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_COMPLAINT_BY_ID(userId || '')}`, {
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch your complaints",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Please check your network connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Complaints
            </h1>
            <p className="text-muted-foreground">Track all your submitted complaints</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {complaints.length > 0 ? (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{complaint.heading}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(complaint.status)}>
                        {getStatusIcon(complaint.status)}
                        <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                      </Badge>
                      {complaint.isAnonymous && (
                        <Badge variant="secondary">Anonymous</Badge>
                      )}
                      {complaint.isPublic && (
                        <Badge variant="outline">Public</Badge>
                      )}
                    </div>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {complaint.description}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {complaint.updatedAt !== complaint.createdAt && (
                    <span>
                      Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-card border-border">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Complaints Yet</CardTitle>
            <CardDescription className="mb-6">
              You haven't submitted any complaints yet. Start by submitting your first complaint.
            </CardDescription>
            <Button
              variant="gradient"
              onClick={() => navigate('/student/complaints/new')}
            >
              Submit New Complaint
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyComplaints;
