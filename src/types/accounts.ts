export interface Assignment {
  id: string;
  owner_id: string;
  space_id: string;
  department_id?: string;
  title: string;
  description: string;
  subject_type?: string;
  level?: string;
  price: number;
  gift: number;
  attachments: string[];
  selected_helper_id?: string;
  deadline: string;
  owner_name?: string;
  owner_username?: string;
  owner_avatar?: string;
  department_name?: string;
  application_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  assignment_id: string;
  user_id: string;
  space_id: string;
  message?: string;
  proof_attachments: string[];
  submission_files: string[];
  submission_notes?: string;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  payment_transaction_id?: string;
  rating?: number;
  review_text?: string;
  review_at?: string;
  money_credited: boolean;
  money_credited_at?: string;
  refund_request: boolean;
  refund_request_at?: string;
  cancel_reason?: string;
  refund_by?: 'owner' | 'helper';
  refund_transaction_id?: string;
  submitted_at?: string;
  applicant_name?: string;
  applicant_username?: string;
  applicant_avatar?: string;
  assignment_title?: string;
  assignment_price?: number;
  assignment_deadline?: string;
  owner_name?: string;
  owner_username?: string;
  created_at: string;
  updated_at?: string;
}

export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'submitted'
  | 'completed'
  | 'revision_requested'
  | 'cancelled';

export type PaymentStatus =
  | 'not_paid'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Earnings {
  total_completed: number;
  total_earnings: number;
  credited_earnings: number;
  pending_earnings: number;
}

export interface AccountDetail {
  id: string;
  user_id: string;
  account_type: 'bank' | 'mobile_money' | 'paypal' | 'other';
  account_number: string;
  account_name: string;
  mobile_money_network?: string;
  payout_requested: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAssignmentRequest {
  space_id: string;
  department_id?: string;
  title: string;
  description: string;
  subject_type?: string;
  level?: string;
  price: string;
  gift?: string;
  attachments?: string[];
  deadline: string;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  subject_type?: string;
  level?: string;
  price?: string;
  gift?: string;
  attachments?: string[];
  deadline?: string;
}

export interface CreateApplicationRequest {
  assignment_id: string;
  space_id: string;
  message?: string;
  proof_attachments?: string[];
}

export interface SubmitWorkRequest {
  submission_files: string[];
  submission_notes?: string;
}

export interface CompleteAssignmentRequest {
  rating?: number;
  review_text?: string;
}

export interface RequestRefundRequest {
  cancel_reason: string;
  refund_by: 'owner' | 'helper';
}

export interface CreateAccountDetailRequest {
  account_type: 'bank' | 'mobile_money' | 'paypal' | 'other';
  account_number: string;
  account_name: string;
  mobile_money_network?: string;
  payout_requested: boolean;
}

export interface UpdateAccountDetailRequest {
  account_type?: 'bank' | 'mobile_money' | 'paypal' | 'other';
  account_number?: string;
  account_name?: string;
  mobile_money_network?: string;
  payout_requested?: boolean;
}

export interface AssignmentsResponse {
  assignments: Assignment[];
  total: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
}

export interface AccountDetailsResponse {
  accounts: AccountDetail[];
  total: number;
}
