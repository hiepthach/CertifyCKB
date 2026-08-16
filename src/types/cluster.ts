import type { SporeClusterDataProps } from '@spore-sdk/core';

export interface ClusterConfig {
  name: string;
  description: string;
  websiteUrl?: string;
  contactEmail?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface Cluster extends ClusterConfig {
  id: string;
  clusterId: string;
  creatorAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClusterWithCount extends Cluster {
  certificateCount?: number;
}

export type { SporeClusterDataProps as ClusterData };
