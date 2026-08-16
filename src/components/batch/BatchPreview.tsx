'use client';

import { Card, Button, Badge, Spinner } from '@/components/ui';
import type { BatchEntry, BatchProgress } from '@/types';
import { truncateAddress } from '@/utils';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BatchPreviewProps {
  entries: BatchEntry[];
  estimatedCost: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  progress?: BatchProgress | null;
}

export function BatchPreview({
  entries,
  estimatedCost,
  onConfirm,
  onCancel,
  loading = false,
  progress,
}: BatchPreviewProps) {
  const validCount = entries.filter((e) => e.valid).length;
  const invalidCount = entries.filter((e) => !e.valid).length;

  return (
    <Card variant="default" padding="lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Preview ({entries.length} certificates)
        </h2>
        <p className="text-sm text-slate-400">
          Review the entries before issuing certificates
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{validCount}</div>
          <div className="text-sm text-slate-400">Valid</div>
        </div>
        <div className="flex-1 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-400">{invalidCount}</div>
          <div className="text-sm text-slate-400">Invalid</div>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm text-white">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{truncateAddress(progress.currentAddress, 8, 6)}</span>
            <span className="capitalize">{progress.status}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400 font-medium">#</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Address</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Name</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Course</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 10).map((entry) => (
              <tr
                key={entry.row}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="py-2 px-3 text-slate-500">{entry.row}</td>
                <td className="py-2 px-3 font-mono text-white">
                  {truncateAddress(entry.recipientAddress, 8, 6)}
                </td>
                <td className="py-2 px-3 text-white">{entry.recipientName || '-'}</td>
                <td className="py-2 px-3 text-white">{entry.courseName}</td>
                <td className="py-2 px-3">
                  {entry.valid ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Badge variant="danger">
                        <XCircle className="w-3 h-3 mr-1" />
                        Invalid
                      </Badge>
                      {entry.errors && entry.errors.length > 0 && (
                        <span
                          className="text-yellow-500 cursor-help"
                          title={entry.errors.join(', ')}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length > 10 && (
          <p className="text-sm text-slate-500 text-center py-2">
            ... and {entries.length - 10} more entries
          </p>
        )}
      </div>

      {/* Cost Estimate */}
      <div className="p-4 bg-slate-800 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Estimated Cost</span>
          <span className="text-lg font-semibold text-white">{estimatedCost}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading || validCount === 0}
          loading={loading}
          className="flex-1"
        >
          {loading ? 'Issuing...' : `Issue ${validCount} Certificates`}
        </Button>
      </div>
    </Card>
  );
}
