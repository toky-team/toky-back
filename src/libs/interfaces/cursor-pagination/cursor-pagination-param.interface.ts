export interface CursorPaginationParam {
  // ISO string
  cursor?: string;
  limit: number;
  order?: 'ASC' | 'DESC';
}
