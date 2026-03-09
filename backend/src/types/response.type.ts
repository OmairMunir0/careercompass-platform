export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data?: {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
