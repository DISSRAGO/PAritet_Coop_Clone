import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { TokenPairDto } from './dtos/TokenPair.dto';
import { RegisterDto } from './dtos/register.dto';
export const LoginSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Login user via email and password' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'JWT tokens for access to endpoints with bearer auth.',
      type: TokenPairDto,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST }),
  );
};

export const RegisterSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST }),
  );
};
