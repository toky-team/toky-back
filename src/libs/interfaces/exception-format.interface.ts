export interface ExceptionFormat {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  context?: string;
}
