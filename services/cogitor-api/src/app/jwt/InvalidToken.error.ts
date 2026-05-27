import { BadRequestException } from '@nestjs/common';

export class InvalidTokenError extends BadRequestException {
  constructor() {
    super({
      message: 'Invalid token.',
    });
  }
}
