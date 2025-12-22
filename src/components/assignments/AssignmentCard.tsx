import React from 'react';
import { Clock, DollarSign, User, Calendar, TrendingUp } from 'lucide-react';
import { Assignment } from '../../types/assignments';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AssignmentCardProps {
  assignment: Assignment;
  showApplicationCount?: boolean;
  onViewDetails?: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  showApplicationCount = true,
  onViewDetails,
}: AssignmentCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(assignment.id);
    } else {
      navigate(`/assignments/${assignment.id}`);
    }
  };

  const isUrgent = new Date(assignment.deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000);
  const totalValue = Number(assignment.price) + Number(assignment.gift);


  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {assignment.title}
        </h3>
        {assignment.gift > 0 && (
          <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +{assignment.gift} GHS
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
        {assignment.description}
      </p>

      <div className="space-y-2 mb-4">
        {assignment.subject_type && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Subject:</span>
            <span>{assignment.subject_type}</span>
          </div>
        )}
        {assignment.level && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Level:</span>
            <span>{assignment.level}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
          <DollarSign className="w-4 h-4" />
          <span>{totalValue.toFixed(2)} GHS</span>
        </div>

        <div
          className={`flex items-center gap-1 ${
            isUrgent
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{format(new Date(assignment.deadline), 'MMM dd, HH:mm')}</span>
        </div>

        {showApplicationCount && assignment.application_count !== undefined && (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <User className="w-4 h-4" />
            <span>{assignment.application_count} applied</span>
          </div>
        )}
      </div>

      {assignment.owner_name && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>Posted by {assignment.owner_name}</span>
          </div>
        </div>
      )}

      {isUrgent && (
        <div className="mt-3">
          <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium rounded">
            Urgent - Due soon!
          </span>
        </div>
      )}
    </div>
  );
}
