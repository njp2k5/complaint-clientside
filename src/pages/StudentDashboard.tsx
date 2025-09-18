import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, RefreshCw, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS } from '@/config';
import { useToast } from '@/hooks/use-toast';

interface ComplaintStats {
  total: number;
  pending: number;
  resolved: number;
  inProgress: number;
}

// ✅ Updated interface to match DB schema (snake_case in DB, converted in frontend)
interface PublicComplaint {
  id: number;
  heading: string;
  description: string;
  status: string;
  createdAt: string;   // mapped from created_at
  isAnonymous: boolean; // mapped from anonymous
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<ComplaintStats>({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [publicComplaints, setPublicComplaints] = useState<PublicComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const userId = localStorage.getItem('userId');

      // ✅ Fetch student’s own complaints
      const statsResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.STUDENT_COMPLAINT_BY_ID(userId || '')}`,
        {
          headers: {
            ...DEFAULT_HEADERS,
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        }
      );

      if (statsResponse.ok) {
        const userComplaints = await statsResponse.json();

        // userComplaints will have snake_case (created_at, anonymous, public)
        const total = userComplaints.length;
        const pending = userComplaints.filter((c: any) => c.status === 'pending').length;
        const resolved = userComplaints.filter((c: any) => c.status === 'resolved').length;
        const inProgress = userComplaints.filter((c: any) => c.status === 'in_progress').length;

        setStats({ total, pending, resolved, inProgress });
      }

      // ✅ Fetch recent public complaints (limit 5)
      const publicResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.STUDENT_COMPLAINTS}?public=true&limit=5`,
        {
          headers: {
            ...DEFAULT_HEADERS,
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        }
      );

      if (publicResponse.ok) {
        const publicData = await publicResponse.json();

        // ✅ Map DB fields → frontend fields
        const normalized = publicData.map((c: any) => ({
          id: c.id,
          heading: c.heading,
          description: c.description,
          status: c.status,
          createdAt: c.created_at,       // map snake_case → camelCase
          isAnonymous: c.anonymous,      // map snake_case → camelCase
        }));

        setPublicComplaints(normalized);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-orange-500/20 text-orange-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* ✅ Fix: Show logged-in student's name instead of admin */}
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome, {localStorage.getItem("userName") || "Student"}
          </h1>
          <p className="text-muted-foreground">Manage your complaints and track their progress</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRefreshing(true);
            fetchDashboardData();
          }}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="gradient"
          onClick={() => navigate('/student/complaints/new')}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit New Complaint
        </Button>
        <Button
          variant="glow"
          onClick={() => navigate('/student/complaints')}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          My Complaints
        </Button>
      </div>

      {/* Recent Public Complaints */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Public Complaints
          </CardTitle>
          <CardDescription>
            Latest complaints made public by other students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publicComplaints.length > 0 ? (
            <div className="space-y-3">
              {publicComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-4 rounded-lg bg-background/50 border border-border hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{complaint.heading}</h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No public complaints available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
