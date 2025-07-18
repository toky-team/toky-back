import { HttpStatus } from '@nestjs/common';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ValueObject } from '~/libs/core/domain-core/value-object';

interface ProfileProps {
  department: string;
  birth: string;
  height: number;
  weight: number;
  position: string;
  backNumber: number;
}

export class ProfileVO extends ValueObject<ProfileProps> {
  private constructor(props: ProfileProps) {
    super(props);
  }

  public static create(
    department: string,
    birth: string,
    height: number,
    weight: number,
    position: string,
    backNumber: number
  ): ProfileVO {
    const newProfile = new ProfileVO({
      department,
      birth,
      height,
      weight,
      position,
      backNumber,
    });
    newProfile.validate();

    return newProfile;
  }

  private validate(): void {
    this.validateDepartment();
    this.validateBirth();
    this.validateHeight();
    this.validateWeight();
    this.validateBackNumber();
  }

  private validateDepartment(): void {
    const department = this.department;
    const regex = /^[가-힣]+( \d{2})?$/;
    if (!regex.test(department)) {
      throw new DomainException(
        'PLAYER',
        'Invalid department format. Use Korean characters followed by a space and 2 digits.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private validateBirth(): void {
    const birth = this.birth;
    const regex = /^\d{4}\.\d{2}\.\d{2}$/;
    if (!regex.test(birth)) {
      throw new DomainException('PLAYER', 'Invalid birth format. Use YYYY.MM.DD.', HttpStatus.BAD_REQUEST);
    }
  }

  private validateHeight(): void {
    const height = this.height;
    if (height <= 0 || height > 300) {
      throw new DomainException(
        'PLAYER',
        'Height must be a positive number and less than or equal to 300 cm.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private validateWeight(): void {
    const weight = this.weight;
    if (weight <= 0 || weight > 200) {
      throw new DomainException(
        'PLAYER',
        'Weight must be a positive number and less than or equal to 200 kg.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private validateBackNumber(): void {
    const backNumber = this.backNumber;
    if (backNumber < 0 || backNumber > 999) {
      throw new DomainException('PLAYER', 'Back number must be between 0 and 999.', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(backNumber)) {
      throw new DomainException('PLAYER', 'Back number must be an integer.', HttpStatus.BAD_REQUEST);
    }
  }

  public get department(): string {
    return this.props.department;
  }

  public get birth(): string {
    return this.props.birth;
  }

  public get height(): number {
    return this.props.height;
  }

  public get weight(): number {
    return this.props.weight;
  }

  public get position(): string {
    return this.props.position;
  }

  public get backNumber(): number {
    return this.props.backNumber;
  }

  override toString(): string {
    return `Profile(department=${this.department}, birth=${this.birth}, height=${this.height}, weight=${this.weight}, position=${this.position}, backNumber=${this.backNumber})`;
  }
}
