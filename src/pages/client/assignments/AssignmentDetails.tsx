import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  User,
  FileText,
  Send,
  CheckCircle,
  Star,
  Trash2,
  Paperclip,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAssignmentById,
  getApplicationsByAssignment,
  createApplication,
  submitWork,
  completeAssignment,
  selectHelper,
  acceptApplication,
  rejectApplication,
  requestRefund,
  verifyAssignmentPayment,
  deleteAssignment,
} from "../../../api/accounts.api";
import { uploadFile } from "../../../api/files.api";
import type { Assignment, Application } from "../../../types/accounts";
import { AssignmentPaymentModal } from "@/components/assignments/AssignmentPaymentModal";

export default function AssignmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [selectedApplicationForPayment, setSelectedApplicationForPayment] =
    useState<Application | null>(null);

  const [applicationMessage, setApplicationMessage] = useState("");
  const [proofAttachments, setProofAttachments] = useState<string[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<string[]>([]);
  const [submissionFileObjects, setSubmissionFileObjects] = useState<File[]>(
    []
  );
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingProofFiles, setUploadingProofFiles] = useState(false);
  const [uploadingSubmissionFiles, setUploadingSubmissionFiles] =
    useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const proofFilesInputRef = useRef<HTMLInputElement>(null);
  const submissionFilesInputRef = useRef<HTMLInputElement>(null);

  const isOwner = assignment?.owner_id === user?.id;

  const canDelete = () => {
    if (!isOwner || !assignment) return false;

    const hasPaidApplications = applications.some(
      (app) => app.payment_status === "paid"
    );

    if (!hasPaidApplications) return true;

    const hasCompletedApplication = applications.some(
      (app) => app.status === "completed"
    );

    return hasCompletedApplication;
  };

  useEffect(() => {
    if (id) {
      loadAssignmentDetails();
    }
  }, [id]);

  const loadAssignmentDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const assignmentData = await getAssignmentById(id);
      setAssignment(assignmentData);

      if (assignmentData.owner_id === user?.id) {
        const appsData = await getApplicationsByAssignment(id);

        const sortedApps = appsData.applications.sort((a, b) => {
          if (a.user_id === assignmentData.selected_helper_id) return -1;
          if (b.user_id === assignmentData.selected_helper_id) return 1;
          return 0;
        });
        setApplications(sortedApps);
      } else {
        const appsData = await getApplicationsByAssignment(id);
        const userApp = appsData.applications.find(
          (app) => app.user_id === user?.id
        );
        if (userApp) {
          setMyApplication(userApp);
        }
      }
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleProofFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/",
      ];

      const isValidType = allowedTypes.some((type) =>
        file.type.startsWith(type)
      );
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const totalFiles = proofFiles.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error("You can only upload up to 5 files");
      const allowedCount = 5 - proofFiles.length;
      validFiles.splice(allowedCount);
    }

    setProofFiles([...proofFiles, ...validFiles]);
  };

  const handleRemoveProofFile = (index: number) => {
    setProofFiles(proofFiles.filter((_, i) => i !== index));
  };

  const handleSubmissionFilesSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/",
      ];

      const isValidType = allowedTypes.some((type) =>
        file.type.startsWith(type)
      );
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const totalFiles = submissionFileObjects.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error("You can only upload up to 5 files");
      const allowedCount = 5 - submissionFileObjects.length;
      validFiles.splice(allowedCount);
    }

    setSubmissionFileObjects([...submissionFileObjects, ...validFiles]);
  };

  const handleRemoveSubmissionFile = (index: number) => {
    setSubmissionFileObjects(
      submissionFileObjects.filter((_, i) => i !== index)
    );
  };

  const handleApply = async () => {
    if (!assignment || !user) return;

    try {
      setSubmitting(true);
      let uploadedProofUrls: string[] = [];

      if (proofFiles.length > 0) {
        setUploadingProofFiles(true);
        const uploadPromises = proofFiles.map((file) =>
          uploadFile({
            file,
            moduleType: "assignments",
            moduleId: assignment.id,
            accessLevel: "public",
          })
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        uploadedProofUrls = uploadedFiles.map((file) => file.url);
        setUploadingProofFiles(false);
      }

      await createApplication({
        assignment_id: assignment.id,
        space_id: assignment.space_id,
        message: applicationMessage || undefined,
        proof_attachments:
          uploadedProofUrls.length > 0 ? uploadedProofUrls : undefined,
      });
      toast.success("Application submitted successfully!");
      loadAssignmentDetails();
      setApplicationMessage("");
      setProofAttachments([]);
      setProofFiles([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to apply");
    } finally {
      setSubmitting(false);
      setUploadingProofFiles(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!myApplication) return;
    if (submissionNotes.length === 0) return toast.success("Noted required");
    if (submissionNotes.length <= 10)
      return toast.success("Notes must be more than 10 characters");

    try {
      setSubmitting(true);
      let uploadedSubmissionUrls: string[] = [];

      if (submissionFileObjects.length > 0) {
        setUploadingSubmissionFiles(true);
        const uploadPromises = submissionFileObjects.map((file) =>
          uploadFile({
            file,
            moduleType: "assignments",
            moduleId: myApplication.assignment_id,
            accessLevel: "public",
          })
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        uploadedSubmissionUrls = uploadedFiles.map((file) => file.url);
        setUploadingSubmissionFiles(false);
      }

      await submitWork(myApplication.id, {
        submission_files: uploadedSubmissionUrls,
        submission_notes: submissionNotes || undefined,
      });
      toast.success("Work submitted successfully!");
      loadAssignmentDetails();
      setSubmissionNotes("");
      setSubmissionFiles([]);
      setSubmissionFileObjects([]);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to submit work"
      );
    } finally {
      setSubmitting(false);
      setUploadingSubmissionFiles(false);
    }
  };

  const handleComplete = async (applicationId: string) => {
    try {
      await completeAssignment(applicationId, {
        rating: rating || undefined,
        review_text: reviewText || undefined,
      });
      toast.success("Assignment completed successfully!");
      loadAssignmentDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to complete assignment"
      );
    }
  };

  const handleSelectHelper = async (applicationId: string) => {
    if (!assignment) return;

    try {
      await selectHelper(assignment.id, applicationId);
      toast.success("Helper selected successfully!");
      loadAssignmentDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to select helper"
      );
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      await acceptApplication(applicationId);
      toast.success("Application accepted!");
      loadAssignmentDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to accept application"
      );
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await rejectApplication(applicationId);
      toast.success("Application rejected");
      loadAssignmentDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to reject application"
      );
    }
  };

  const handlePayment = async (reference: string) => {
    if (!selectedApplicationForPayment || !assignment) return;

    try {
      setProcessingPayment(true);

      await verifyAssignmentPayment({
        reference: reference,
      });

      toast.success("Payment verified successfully!");
      setShowPaymentModal(false);
      setSelectedApplicationForPayment(null);
      loadAssignmentDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to verify payment"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDelete = async () => {
    if (!assignment) return;

    try {
      setDeleting(true);
      await deleteAssignment(assignment.id);
      toast.success("Assignment deleted successfully!");
      navigate("/assignments");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete assignment"
      );
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
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

  if (!assignment) {
    return null;
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 max-w-4xl mx-auto custom-fonts">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/assignments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>

          {canDelete() && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Assignment
            </Button>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            {assignment.gift > 0 && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded-full">
                +{assignment.gift} GHS Bonus
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
              <DollarSign className="h-5 w-5" />
              <span>
                {(Number(assignment.price) + Number(assignment.gift)).toFixed(
                  2
                )}{" "}
                GHS
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>
                Due:{" "}
                {format(new Date(assignment.deadline), "MMM dd, yyyy HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-5 w-5" />
              <span>{assignment.owner_name}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>

          {assignment.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Attachments</h3>
              <div className="space-y-2">
                {assignment.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              Applications ({applications.length})
            </h2>
            {applications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No applications yet
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`border rounded-lg p-4 ${
                      app.user_id === assignment.selected_helper_id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3
                          onClick={() =>
                            navigate(`/assignments/applications/${app.id}`)
                          }
                          className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                        >
                          {app.applicant_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Applied{" "}
                          {format(new Date(app.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            app.status === "accepted"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : app.status === "rejected"
                              ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                              : app.status === "submitted"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          }`}
                        >
                          {app.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/assignments/applications/${app.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {app.message && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {app.message}
                      </p>
                    )}

                    {app.proof_attachments &&
                      app.proof_attachments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-sm">
                            Proof Attachments:
                          </h4>
                          <div className="space-y-1">
                            {app.proof_attachments.map((file, idx) => (
                              <a
                                key={idx}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              >
                                <FileText className="w-3 h-3 inline mr-1" />
                                {file}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {app.status === "accepted" &&
                      app.payment_status === "not_paid" && (
                        <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold mb-2 text-orange-900 dark:text-orange-100">
                            Payment Required
                          </h4>
                          <p className="text-orange-700 dark:text-orange-300 mb-3 text-sm">
                            Complete payment to enable {app.applicant_name} to
                            start working
                          </p>
                          <Button
                            onClick={() => {
                              setSelectedApplicationForPayment(app);
                              setShowPaymentModal(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                          >
                            <DollarSign className="h-5 w-5" />
                            Pay{" "}
                            {(
                              Number(assignment.price) + Number(assignment.gift)
                            ).toFixed(2)}{" "}
                            GHS
                          </Button>
                        </div>
                      )}

                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSelectHelper(app.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Select as Helper
                        </Button>
                        <Button
                          onClick={() => handleRejectApplication(app.id)}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {app.status === "submitted" &&
                      app.payment_status === "paid" && (
                        <div>
                          <h4 className="font-semibold mb-2">
                            Submitted Work:
                          </h4>
                          {app.submission_notes && (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {app.submission_notes}
                            </p>
                          )}
                          <div className="mb-4">
                            {app.submission_files.map((file, idx) => (
                              <a
                                key={idx}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <FileText className="w-4 h-4 inline mr-2" />
                                {file}
                              </a>
                            ))}
                          </div>

                          {reviewingAppId === app.id ? (
                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 mb-3">
                              <h5 className="font-semibold mb-3">
                                Leave a Review
                              </h5>
                              <div className="mb-3">
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
                                        className={`h-6 w-6 ${
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
                                className="mb-3"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={async () => {
                                    if (rating === 0) {
                                      toast.error("Please provide a rating");
                                      return;
                                    }
                                    await handleComplete(app.id);
                                    setReviewingAppId(null);
                                    setRating(0);
                                    setReviewText("");
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={submitting}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {submitting
                                    ? "Completing..."
                                    : "Complete & Submit Review"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setReviewingAppId(null);
                                    setRating(0);
                                    setReviewText("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setReviewingAppId(app.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Complete
                            </Button>
                          )}
                        </div>
                      )}

                    {app.status === "completed" && (
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                          ✓ Assignment Completed
                        </h4>
                        {app.rating && (
                          <div className="mb-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (app.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {app.review_text && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {app.review_text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isOwner && (
          <div className="bg-card border rounded-lg p-6">
            {!myApplication ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Apply for this Assignment
                </h2>
                <Textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the owner why you're a good fit for this assignment..."
                  className="min-h-[120px] mb-4"
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Proof Attachments (Optional)
                  </label>
                  <div className="space-y-3">
                    {proofFiles.length > 0 && (
                      <div className="space-y-2">
                        {proofFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProofFile(index)}
                              disabled={submitting || uploadingProofFiles}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      ref={proofFilesInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleProofFilesSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => proofFilesInputRef.current?.click()}
                      disabled={
                        submitting ||
                        uploadingProofFiles ||
                        proofFiles.length >= 5
                      }
                      className="w-full"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      {proofFiles.length > 0
                        ? `Add More Files (${proofFiles.length}/5)`
                        : "Attach Proof Files"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload proof of your expertise: portfolio, previous work,
                    etc. (Max 5 files, 10MB each)
                  </p>
                </div>
                <Button
                  onClick={handleApply}
                  disabled={submitting || uploadingProofFiles}
                  className="flex items-center gap-2"
                >
                  {uploadingProofFiles ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading Files...
                    </>
                  ) : submitting ? (
                    <>
                      <Send className="h-5 w-5" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Application</h2>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      myApplication.status === "accepted"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : myApplication.status === "rejected"
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        : myApplication.status === "submitted"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    Status: {myApplication.status}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      myApplication.payment_status === "paid"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : myApplication.payment_status === "not_paid"
                        ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                        : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    Payment: {myApplication.payment_status}
                  </span>
                </div>

                {myApplication.status === "accepted" &&
                  myApplication.payment_status === "not_paid" && (
                    <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-4">
                      <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                        Application Accepted!
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300">
                        The assignment owner is processing the payment. Once
                        payment is complete, you'll be able to start working and
                        submit your work.
                      </p>
                    </div>
                  )}

                {myApplication.status === "accepted" &&
                  myApplication.payment_status === "not_paid" && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/20">
                      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Submission Form
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                        Awaiting payment from assignment owner before you can
                        submit your work.
                      </p>
                    </div>
                  )}

                {myApplication.status === "accepted" &&
                  myApplication.payment_status === "paid" &&
                  !myApplication.submitted_at && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Submit Your Work
                      </h3>
                      <Textarea
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="Add notes about your submission..."
                        className="mb-4"
                        rows={3}
                      />
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Submission Files{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-3">
                          {submissionFileObjects.length > 0 && (
                            <div className="space-y-2">
                              {submissionFileObjects.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveSubmissionFile(index)
                                    }
                                    disabled={
                                      submitting || uploadingSubmissionFiles
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            ref={submissionFilesInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            onChange={handleSubmissionFilesSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              submissionFilesInputRef.current?.click()
                            }
                            disabled={
                              submitting ||
                              uploadingSubmissionFiles ||
                              submissionFileObjects.length >= 5
                            }
                            className="w-full"
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            {submissionFileObjects.length > 0
                              ? `Add More Files (${submissionFileObjects.length}/5)`
                              : "Attach Submission Files"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload your completed work (Max 5 files, 10MB each)
                        </p>
                      </div>
                      <Button
                        onClick={handleSubmitWork}
                        disabled={
                          submitting ||
                          uploadingSubmissionFiles ||
                          submissionNotes.length <= 10
                        }
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        {uploadingSubmissionFiles ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Uploading Files...
                          </>
                        ) : submitting ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Submit Work
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                {myApplication.submitted_at && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Submitted Work</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/assignments/applications/${myApplication.id}`
                          )
                        }
                      >
                        View Full Details
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4 mb-4 bg-green-50 dark:bg-green-900/20">
                      <p className="text-green-600 dark:text-green-400 mb-2">
                        Work submitted on{" "}
                        {format(
                          new Date(myApplication.submitted_at),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                      {myApplication.submission_notes && (
                        <div className="mb-3">
                          <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {myApplication.submission_notes}
                          </p>
                        </div>
                      )}
                      {myApplication.submission_files.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Files:</h4>
                          <div className="space-y-1">
                            {myApplication.submission_files.map((file, idx) => (
                              <a
                                key={idx}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              >
                                <FileText className="w-3 h-3 inline mr-1" />
                                {file}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {myApplication.status === "completed" ? (
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Assignment Completed
                        </h4>
                        {myApplication.rating && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Rating:</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= (myApplication.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {myApplication.review_text && (
                          <div>
                            <p className="text-sm font-medium mb-1">Review:</p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {myApplication.review_text}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Waiting for owner to review and complete
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedApplicationForPayment && assignment && user?.email && (
          <AssignmentPaymentModal
            open={showPaymentModal}
            onOpenChange={setShowPaymentModal}
            assignment={assignment}
            application={selectedApplicationForPayment}
            userEmail={user.email}
            onPayment={handlePayment}
            isLoading={processingPayment}
          />
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this assignment? This action
                cannot be undone.
                {applications.some((app) => app.payment_status === "paid") && (
                  <span className="block mt-2 text-orange-600 dark:text-orange-400 font-semibold">
                    Note: Payments have been made for this assignment. Please
                    ensure all work has been completed before deletion.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
