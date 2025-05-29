import { HttpStatus } from '@nestjs/common';

export class DomainException extends Error {
  statusCode: HttpStatus;
  constructor(domainName: string, message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    const errorMessage = `[${domainName}] ${message}`;
    super(errorMessage);
    this.name = 'DomainException';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
