import { File } from '~/libs/common/storage/storage.client';

/**
 * Express의 Multer 파일 객체를 File 인터페이스 형식으로 변환합니다.
 * @param file - Express의 Multer 파일 객체
 * @returns File 형식으로 변환된 객체
 */
export function toFile(file: Express.Multer.File): File {
  const { originalname, mimetype, buffer, size } = file;

  return {
    originalname,
    mimetype,
    buffer,
    size,
  };
}

/**
 * 파일이 이미지인지 확인합니다.
 */
export function isImageFile(file: File): boolean {
  const { mimetype } = file;

  // MIME 타입으로 이미지 확인
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/ico',
  ];

  return imageTypes.includes(mimetype.toLowerCase());
}

/**
 * 파일 확장자로 이미지인지 확인합니다.
 */
export function isImageByExtension(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.ico'];

  const extension = filename.toLowerCase().split('.').pop();
  return extension ? imageExtensions.includes(`.${extension}`) : false;
}

/**
 * 더 엄격한 이미지 파일 검증 (MIME 타입 + 확장자)
 */
export function isValidImageFile(file: File): boolean {
  const { originalname } = file;

  // MIME 타입과 확장자 모두 확인
  return isImageFile(file) && isImageByExtension(originalname);
}

/**
 * 허용된 이미지 형식인지 확인 (일반적으로 사용되는 형식만)
 */
export function isAllowedImageFormat(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  return allowedTypes.includes(file.mimetype.toLowerCase());
}

/**
 * 이미지 파일 크기 제한 확인
 */
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // MB를 바이트로 변환
  return file.size <= maxSizeBytes;
}

/**
 * 종합적인 이미지 파일 검증
 */
export function validateImageFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedFormats?: string[];
    strictValidation?: boolean;
  } = {}
): { isValid: boolean; error?: string } {
  const { maxSizeMB = 5, allowedFormats, strictValidation = true } = options;

  // 기본 이미지 타입 확인
  if (!isImageFile(file)) {
    return { isValid: false, error: '이미지 파일만 업로드할 수 있습니다.' };
  }

  // 엄격한 검증 (확장자도 확인)
  if (strictValidation && !isValidImageFile(file)) {
    return { isValid: false, error: '파일 확장자와 MIME 타입이 일치하지 않습니다.' };
  }

  // 허용된 형식 확인
  if (allowedFormats && !allowedFormats.includes(file.mimetype)) {
    return { isValid: false, error: `허용된 형식: ${allowedFormats.join(', ')}` };
  }

  // 파일 크기 확인
  if (!isValidImageSize(file, maxSizeMB)) {
    return { isValid: false, error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.` };
  }

  return { isValid: true };
}

/**
 * 이미지 파일만 필터링
 */
export function filterImageFiles(files: File[]): File[] {
  return files.filter((file) => isImageFile(file));
}

/**
 * 파일 타입별 분류
 */
export function categorizeFiles(files: File[]): {
  images: File[];
  others: File[];
} {
  const images: File[] = [];
  const others: File[] = [];

  files.forEach((file) => {
    if (isImageFile(file)) {
      images.push(file);
    } else {
      others.push(file);
    }
  });

  return { images, others };
}
