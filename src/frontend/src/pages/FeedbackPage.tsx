import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useSubmitFeedback, useGetAllFeedback } from '../hooks/useQueries';
import { Variant_pending_approved_rejected } from '../backend';
import { toast } from 'sonner';
import type { Page } from '../App';

interface FeedbackPageProps {
  onNavigate: (page: Page) => void;
}

export function FeedbackPage({ onNavigate }: FeedbackPageProps) {
  const [comment, setComment] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  
  const submitFeedback = useSubmitFeedback();
  const { data: allFeedback, isLoading: isLoadingFeedback, refetch } = useGetAllFeedback();

  // Generate a simple device ID from browser fingerprint
  const getDeviceId = () => {
    const stored = localStorage.getItem('capsule-device-id');
    if (stored) return stored;
    
    const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('capsule-device-id', newId);
    return newId;
  };

  const handleSubmit = async () => {
    // Validate comment
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (comment.length > 250) {
      toast.error('Comment must be 250 characters or less');
      return;
    }

    // Rate limiting: 1 submission per minute
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    const oneMinute = 60 * 1000;

    if (timeSinceLastSubmit < oneMinute) {
      const secondsRemaining = Math.ceil((oneMinute - timeSinceLastSubmit) / 1000);
      toast.error(`Please wait ${secondsRemaining} seconds before submitting again`);
      return;
    }

    try {
      const deviceId = getDeviceId();
      await submitFeedback.mutateAsync({ deviceId, comment });
      
      toast.success('Feedback submitted successfully!');
      setComment('');
      setLastSubmitTime(now);
      
      // Refetch feedback list
      refetch();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Filter approved feedback only
  const approvedFeedback = allFeedback?.filter(f => f.approvalStatus === Variant_pending_approved_rejected.approved) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Feedback
          </h1>
          <p className="text-muted-foreground">
            Share your thoughts and help us improve CapsuleVault
          </p>
        </div>

        {/* Submit Feedback Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Your feedback helps us make CapsuleVault better. Maximum 250 characters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts, suggestions, or report issues..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={250}
                rows={4}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{comment.length}/250 characters</span>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Feedback is public and anonymous. Please don't include personal information.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSubmit}
              disabled={submitFeedback.isPending || !comment.trim()}
              className="w-full"
            >
              {submitFeedback.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Community Feedback</CardTitle>
            <CardDescription>
              Recent feedback from the CapsuleVault community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFeedback ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : approvedFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedback yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-4">
                {approvedFeedback.map((feedback) => (
                  <div
                    key={Number(feedback.id)}
                    className="p-4 rounded-lg border border-border bg-card/50 space-y-2"
                  >
                    <p className="text-foreground">{feedback.comment}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(feedback.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
