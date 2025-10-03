
import { AppLayout } from '@/components/layout/AppLayout';
import { TutorApplicationForm } from '@/components/applications/TutorApplicationForm';

const BecomeTutor = () => {
  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 custom-fonts">
        <TutorApplicationForm />
      </div>
    </AppLayout>
  );
};

export default BecomeTutor;
