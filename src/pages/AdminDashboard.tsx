import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, BarChart3, Clock, CheckCircle, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS } from '@/config';
import { useToast } from '@/hooks/use-toast';

interface ComplaintStats {
  total: number;
  pending: number;
  resolved: number;
  inProgress: number;
}

interface PublicComplaint {
  id: string;
  heading: string;
  description: string;
  status: string;
  createdAt: string;
  isAnonymous: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<ComplaintStats>({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [publicComplaints, setPublicComplaints] = useState<PublicComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      // Fetch all complaints for admin stats
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_COMPLAINTS}`, {
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });

      if (response.ok) {
        const complaints = await response.json();
        const total = complaints.length;
        const pending = complaints.filter((c: any) => c.status === 'pending').length;
        const resolved = complaints.filter((c: any) => c.status === 'resolved').length;
        const inProgress = complaints.filter((c: any) => c.status === 'in_progress').length;
        
        setStats({ total, pending, resolved, inProgress });
        
        // Get recent public complaints (last 5)
        const recentPublic = complaints
          .filter((c: any) => c.isPublic)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setPublicComplaints(recentPublic);
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

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_REPORT}`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });

      if (response.ok) {
        const reportData = await response.json();
        setReport(reportData.report || JSON.stringify(reportData, null, 2));
        toast({
          title: "Success",
          description: "Report generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate report",
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
      setGeneratingReport(false);
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
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-orange-500/20 text-orange-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage complaints and generate reports</p>
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
        <Card className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300">
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
        
        <Card className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300">
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
        
        <Card className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300">
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
        
        <Card className="bg-gradient-card border-border hover:shadow-purple transition-all duration-300">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="gradient"
          onClick={() => navigate('/admin/complaints')}
          className="h-14"
        >
          <FileText className="w-5 h-5 mr-2" />
          Manage All Complaints
        </Button>
        <Button
          variant="glow"
          onClick={generateReport}
          disabled={generatingReport}
          className="h-14"
        >
          {generatingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5 mr-2" />
              Generate Report
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(report)}`, '_blank')}
          disabled={!report}
          className="h-14"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Generated Report */}
      {report && (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Generated Report
            </CardTitle>
            <CardDescription>Latest complaint analysis and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={report}
              readOnly
              rows={10}
              className="bg-background/50 font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Public Complaints */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Public Complaints
          </CardTitle>
          <CardDescription>
            Latest complaints made public by students
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
                        {complaint.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                        )}
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

export default AdminDashboard;