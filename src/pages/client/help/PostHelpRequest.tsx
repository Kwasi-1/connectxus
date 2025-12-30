import { AppLayout } from '@/components/layout/AppLayout';
import { HelpRequestForm } from '@/components/help_requests/HelpRequestForm';

const PostHelpRequest = () => {
  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 custom-fonts">
        <HelpRequestForm />
      </div>
    </AppLayout>
  );
};

export default PostHelpRequest;
