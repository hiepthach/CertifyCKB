export * from './credentials';
export * from './cluster';
export * from './template';
export * from './batch';

// Network types
export type Network = 'testnet' | 'mainnet';

export interface NetworkConfig {
  ckbNodeUrl: string;
  ckbIndexerUrl: string;
  explorerUrl: string;
}

// Common utility types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
