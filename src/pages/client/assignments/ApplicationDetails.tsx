import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  Star,
  Calendar,
  AlertCircle,
  Package,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getApplicationById,
  completeAssignment,
} from "../../../api/assignments.api";
import type { Application } from "../../../types/assignments";

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplicationDetails();
    }
  }, [id]);

  const loadApplicationDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getApplicationById(id);
      setApplication(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to load application"
      );
      navigate("/assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!application) return;

    try {
      setSubmitting(true);
      await completeAssignment(application.id, {
        rating: rating || undefined,
        review_text: reviewText || undefined,
      });
      toast.success("Assignment marked as complete!");
      setShowReviewForm(false);
      setRating(0);
      setReviewText("");
      loadApplicationDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to complete assignment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return null;
  }

  const isOwner = application.owner_name && user?.id !== application.user_id;
  const isHelper = application.user_id === user?.id;

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 max-w-5xl mx-auto custom-fonts">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/assignments")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>

        {/* Header */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {application.assignment_title || "Application Details"}
              </h1>
              <div className="flex gap-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    application.status === "accepted"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : application.status === "rejected"
                      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      : application.status === "submitted"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : application.status === "completed"
                      ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  Status: {application.status}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    application.payment_status === "paid"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : application.payment_status === "not_paid"
                      ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                      : application.payment_status === "refunded"
                      ? "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }`}
                >
                  Payment: {application.payment_status}
                </span>
              </div>
            </div>
            {application.assignment_price !== undefined && (
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Number(application.assignment_price).toFixed(2)} GHS
                </div>
                <p className="text-sm text-muted-foreground">Total Payment</p>
              </div>
            )}
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {isHelper ? "Assignment Owner" : "Helper"}
                </p>
                <p className="font-semibold">
                  {isHelper
                    ? application.owner_name
                    : application.applicant_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="font-semibold">
                  {format(new Date(application.created_at), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            {application.assignment_deadline && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold">
                    {format(
                      new Date(application.assignment_deadline),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Details Section */}
        {isHelper && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="h-6 w-6" />
              Assignment Details
            </h2>
            <div className="space-y-4">
              {application.assignment_title && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Title</h3>
                  <p className="text-muted-foreground">
                    {application.assignment_title}
                  </p>
                </div>
              )}
              {/* Assignment description would need to be added to the Application type */}
            </div>
          </div>
        )}

        {/* Application Message */}
        {application.message && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">Application Message</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {application.message}
            </p>
          </div>
        )}

        {/* Proof Attachments */}
        {application.proof_attachments &&
          application.proof_attachments.length > 0 && (
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Proof Attachments</h2>
              <div className="space-y-2">
                {application.proof_attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    {file}
                  </a>
                ))}
              </div>
            </div>
          )}

        {/* Payment Status Info */}
        {application.status === "accepted" &&
          application.payment_status === "not_paid" && (
            <div className="bg-card border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    {isHelper ? "Awaiting Payment" : "Payment Required"}
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300">
                    {isHelper
                      ? "The assignment owner is processing the payment. Once completed, you can start working on this assignment."
                      : "Complete the payment to enable the helper to start working on your assignment."}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Submitted Work */}
        {application.submitted_at && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Submitted Work
              </h2>
              <p className="text-sm text-muted-foreground">
                Submitted on{" "}
                {format(
                  new Date(application.submitted_at),
                  "MMM dd, yyyy HH:mm"
                )}
              </p>
            </div>

            {application.submission_notes && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Notes:</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {application.submission_notes}
                </p>
              </div>
            )}

            {application.submission_files &&
              application.submission_files.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Submitted Files:</h3>
                  <div className="space-y-2">
                    {application.submission_files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        {file}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Complete Assignment Button (Owner Only) */}
            {isOwner &&
              application.status === "submitted" &&
              application.payment_status === "paid" &&
              !showReviewForm && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete & Review
                  </Button>
                </div>
              )}

            {/* Review Form */}
            {showReviewForm && isOwner && (
              <div className="mt-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-semibold mb-4">Leave a Review</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience working with this helper..."
                  className="mb-4"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleComplete}
                    disabled={submitting || rating === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {submitting ? "Completing..." : "Complete & Submit Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setRating(0);
                      setReviewText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Section (Completed) */}
        {application.status === "completed" && (
          <div className="bg-card border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
                Assignment Completed
              </h2>
            </div>

            {application.rating && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Rating:</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= (application.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {application.review_text && (
              <div>
                <h3 className="font-semibold mb-2">Review:</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {application.review_text}
                </p>
              </div>
            )}

            {application.review_at && (
              <p className="text-sm text-muted-foreground mt-4">
                Reviewed on{" "}
                {format(new Date(application.review_at), "MMM dd, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Awaiting Review Message (Helper View) */}
        {isHelper &&
          application.status === "submitted" &&
          application.payment_status === "paid" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Awaiting Review
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Your work has been submitted. Waiting for the assignment
                    owner to review and mark it as complete.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </AppLayout>
  );
}
