import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, lead, onCancel, onConfirm, isDeleting }) {
if (!isOpen || !lead) return null;

return (







Delete Lead

Are you sure you want to delete{' '}
{lead.name} from{' '}
{lead.company}? This action cannot be undone.

    <div className="flex items-center justify-end gap-3 mt-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={isDeleting}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors"
      >
        {isDeleting ? 'Deleting...' : 'Delete Lead'}
      </button>
    </div>
  </div>
</div>
);
}