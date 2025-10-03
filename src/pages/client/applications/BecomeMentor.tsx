
import { AppLayout } from '@/components/layout/AppLayout';
import { MentorApplicationForm } from '@/components/applications/MentorApplicationForm';

const BecomeMentor = () => {
  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 custom-fonts">
        <MentorApplicationForm />
      </div>
    </AppLayout>
  );
};

export default BecomeMentor;
