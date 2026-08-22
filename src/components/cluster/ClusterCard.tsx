'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { Cluster } from '@/types';
import { formatDate } from '@/utils';
import { Calendar, Award, ArrowRight } from 'lucide-react';

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
    <Card variant="interactive" padding="lg" className="group flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-4">
          {/* Doppler Avatar Mark */}
          <div className="w-12 h-12 rounded-xl bg-midnight-plum border border-lavender-spark/30 flex items-center justify-center text-lg font-bold text-lavender-spark flex-shrink-0 shadow-glow-sm group-hover:scale-105 transition-transform duration-200">
            {cluster.name.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-bone-white truncate tracking-tight">
                {cluster.name}
              </h3>
              <Badge variant="success" pulse>Active</Badge>
            </div>

            <p className="text-sm text-ash-veil mb-3 line-clamp-2 leading-relaxed">
              {cluster.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-xs text-mid-ash">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-lavender-spark" />
                <span>{certificateCount} DOBs issued</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-mid-ash" />
                <span>{formatDate(cluster.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-5 pt-4 border-t border-fog-line/10">
        <Button variant="secondary" size="sm" onClick={onManage} className="flex-1 text-xs">
          Manage
        </Button>
        <Button size="sm" onClick={onIssue} className="flex-1 text-xs gap-1">
          <span>Issue DOB</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}

