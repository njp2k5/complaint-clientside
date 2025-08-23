import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, FileText } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS } from '@/config';
import { useToast } from '@/hooks/use-toast';

const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    isAnonymous: false,
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.heading.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_COMPLAINTS}`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({
          ...formData,
          studentId: localStorage.getItem('userId'),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your complaint has been submitted successfully",
        });
        navigate('/student/dashboard');
      } else {
        const error = await response.text();
        toast({
          title: "Submission Failed",
          description: error || "Failed to submit complaint",
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
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
            Submit New Complaint
          </h1>
          <p className="text-muted-foreground">Fill out the form below to submit your complaint</p>
        </div>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Complaint Details
          </CardTitle>
          <CardDescription>
            Provide detailed information about your complaint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="heading">Complaint Heading *</Label>
              <Input
                id="heading"
                placeholder="Brief summary of your complaint"
                value={formData.heading}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="bg-background/50 resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Anonymous Submission</Label>
                <Select
                  value={formData.isAnonymous ? 'true' : 'false'}
                  onValueChange={(value) => setFormData({ ...formData, isAnonymous: value === 'true' })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Submit with my identity</SelectItem>
                    <SelectItem value="true">Submit anonymously</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: !!checked })}
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make this complaint public (visible to other students)
                </Label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitComplaint;