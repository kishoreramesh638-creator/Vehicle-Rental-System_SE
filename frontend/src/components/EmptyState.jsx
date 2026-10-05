import React from 'react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 max-w-lg mx-auto my-6">
      {Icon && (
        <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {(actionLabel && actionLink) && (
        <div className="mt-5">
          <Link
            to={actionLink}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            {actionLabel}
          </Link>
        </div>
      )}
      {(actionLabel && onAction && !actionLink) && (
        <div className="mt-5">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
