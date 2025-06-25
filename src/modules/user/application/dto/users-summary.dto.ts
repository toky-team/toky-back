export interface UsersSummaryDto {
  totalUsers: number;
  KUUsers: number;
  YUUsers: number;
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}
