/**
 * 파일 스토리지를 위한 인터페이스
 * 업로드 및 삭제 메서드를 제공합니다.
 * getFileUrl 메서드는 선택적입니다. (Presigned URLs를 사용하는 경우)
 */
export abstract class StorageClient {
  /**
   * 파일을 업로드 합니다.
   *
   * @param file - 업로드할 파일
   * @param path - 파일을 저장할 경로
   * @returns 업로드된 파일의 URL 및 key
   */
  abstract uploadFile(file: File, path: string): Promise<UploadFileResponse>;

  /**
   * 파일을 삭제합니다.
   *
   * @param key - 삭제할 파일의 key
   */
  abstract deleteFile(key: string): Promise<void>;

  /**
   * 파일을 변경합니다. (새 파일로 대체)
   * 기존 파일을 삭제하고 새 파일을 업로드합니다.
   * 기존 파일의 삭제에 실패해도 로그만 남기고 진행합니다.
   *
   * @param newFile - 새로 업로드할 파일
   * @param path - 새 파일을 저장할 경로
   * @param oldKey - 기존 파일의 key
   * @returns 변경된 파일의 URL 및 key
   */
  abstract changeFile(newFile: File, path: string, oldKey: string): Promise<UploadFileResponse>;

  /**
   * 파일의 URL을 반환합니다.
   *
   * @param key - 파일의 key
   * @returns 파일의 URL
   */
  abstract getFileUrl?(key: string): string;
}

export interface File {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadFileResponse {
  url: string;
  key: string;
}
