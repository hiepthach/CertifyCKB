'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { Cluster } from '@/types';
import { formatDate } from '@/utils';
import { Users, Calendar, Award } from 'lucide-react';

interface ClusterCardProps {
  cluster: Cluster;
  certificateCount?: number;
  onManage?: () => void;
  onIssue?: () => void;
}

export function ClusterCard({
  cluster,
  certificateCount = 0,
  onManage,
  onIssue,
}: ClusterCardProps) {
  return (
    <Card variant="interactive" padding="lg" className="hover:border-blue-500/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl font-bold text-white">
          {cluster.name.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {cluster.name}
            </h3>
            <Badge variant="success">Active</Badge>
          </div>

          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {cluster.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{certificateCount} certificates</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(cluster.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
        <Button variant="secondary" size="sm" onClick={onManage}>
          Manage
        </Button>
        <Button size="sm" onClick={onIssue}>
          Issue Certificate
        </Button>
      </div>
    </Card>
  );
}
