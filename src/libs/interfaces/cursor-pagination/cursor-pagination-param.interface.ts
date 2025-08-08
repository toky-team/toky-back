export interface CursorPaginationParam {
  // 인코딩된 커서 String
  cursor?: string;
  limit: number;
  order?: 'ASC' | 'DESC';
}
