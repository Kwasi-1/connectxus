import React from 'react';
import { User, Calendar, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Application } from '../../types/accounts';
import { format } from 'date-fns';

interface ApplicationCardProps {
  application: Application;
  onViewDetails?: (id: string) => void;
}

export function ApplicationCard({
  application,
  onViewDetails,
}: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'submitted':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'completed':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'pending':
      default:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'failed':
      case 'refunded':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'not_paid':
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(application.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {application.assignment_title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {application.assignment_title}
            </h3>
          )}
          {application.applicant_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>{application.applicant_name}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              application.status
            )}`}
          >
            {application.status}
          </span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
              application.payment_status
            )}`}
          >
            {application.payment_status}
          </span>
        </div>
      </div>

      {application.message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {application.message}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Applied {format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
        </div>

        {application.assignment_price && (
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
            <span>Payment: {Number(application.assignment_price).toFixed(2)} GHS</span>
          </div>
        )}

        {application.submitted_at && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <FileText className="w-4 h-4" />
            <span>Submitted {format(new Date(application.submitted_at), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {application.rating && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <span>{'⭐'.repeat(application.rating)}</span>
          </div>
        )}
      </div>

      {application.refund_request && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded">
            Refund Requested
          </span>
        </div>
      )}
    </div>
  );
}
