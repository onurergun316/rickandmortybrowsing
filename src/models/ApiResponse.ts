export type ApiInfo = {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
};

export type ApiResponse<T> = {
  info: ApiInfo;
  results: T[];
};