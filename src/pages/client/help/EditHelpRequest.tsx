import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { HelpRequestForm } from "@/components/help_requests/HelpRequestForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getHelpRequest } from "@/api/help_requests.api";
import { toast } from "sonner";

const EditHelpRequest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpRequest = async () => {
      if (!id) {
        navigate("/help");
        return;
      }

      try {
        const data = await getHelpRequest(id);
        setInitialData(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.error?.message || "Failed to load help request");
        navigate("/help");
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequest();
  }, [id, navigate]);

  if (loading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 custom-fonts">
        <HelpRequestForm initialData={initialData} isEditing={true} />
      </div>
    </AppLayout>
  );
};

export default EditHelpRequest;
