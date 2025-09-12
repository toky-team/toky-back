import * as fs from 'fs';
import * as path from 'path';

export class LogDirectoryUtil {
  /**
   * 로그 디렉토리가 존재하지 않으면 생성합니다.
   */
  public static ensureLogDirectory(): void {
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
}
