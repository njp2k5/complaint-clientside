import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Clock, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { API_BASE_URL, DEFAULT_HEADERS } from '@/config';
import { useToast } from '@/hooks/use-toast';

// ✅ Backend endpoints (matches your FastAPI app)
const ENDPOINTS = {
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_UPDATE_COMPLAINT: (id: string | number) => `/admin/complaints/${id}`,
};

interface Complaint {
  id: string;
  heading: string;
  description: string;
  status: string;
  isAnonymous: boolean;
  isPublic: boolean;
  studentId: string;
  createdAt: string;
  updatedAt: string;
}

const AdminComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ADMIN_COMPLAINTS}`, {
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map DB snake_case -> UI camelCase the component expects
        const mapped: Complaint[] = (data || []).map((c: any) => ({
          id: String(c.id),
          heading: c.heading,
          description: c.description,
          status: c.status, // expects: pending | in_progress | resolved
          isAnonymous: !!c.anonymous,
          isPublic: !!c.public,
          studentId: String(c.student_id),
          createdAt: c.created_at,
          // schema has no updated_at; initialize to created_at
          updatedAt: c.updated_at ?? c.created_at,
        }));
        setComplaints(mapped);
      } else {
        let msg = 'Failed to fetch complaints';
        try {
          const err = await response.json();
          if (err?.detail) msg = err.detail;
        } catch {}
        toast({
          title: 'Error',
          description: msg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Please check your network connection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    setUpdatingStatus(complaintId);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ADMIN_UPDATE_COMPLAINT(complaintId)}`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        // ✅ Backend expects lowercase: pending | in_progress | resolved
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setComplaints(complaints.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: newStatus, updatedAt: new Date().toISOString() }
            : complaint
        ));
        toast({
          title: 'Success',
          description: 'Complaint status updated successfully',
        });
      } else {
        let msg = 'Failed to update complaint status';
        try {
          const err = await response.json();
          if (err?.detail) msg = err.detail;
        } catch {
          const txt = await response.text();
          if (txt) msg = txt;
        }
        toast({
          title: 'Error',
          description: msg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Please check your network connection',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              All Complaints
            </h1>
            <p className="text-muted-foreground">Manage and update complaint statuses</p>
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
                    <p className="text-sm text-muted-foreground">
                      Student ID: {complaint.isAnonymous ? 'Hidden' : complaint.studentId}
                    </p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {complaint.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Select
                        value={complaint.status}
                        onValueChange={(value) => updateComplaintStatus(complaint.id, value)}
                        disabled={updatingStatus === complaint.id}
                      >
                        <SelectTrigger className="w-40 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingStatus === complaint.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground text-right">
                    <div>
                      Submitted: {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                      {new Date(complaint.createdAt).toLocaleTimeString()}
                    </div>
                    {complaint.updatedAt !== complaint.createdAt && (
                      <div>
                        Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-card border-border">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Complaints Found</CardTitle>
            <CardDescription>
              There are currently no complaints in the system.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminComplaints;
