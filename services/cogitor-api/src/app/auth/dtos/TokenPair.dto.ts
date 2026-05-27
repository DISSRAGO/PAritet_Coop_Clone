import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, MinLength } from 'class-validator';

export class TokenPairDto {
  @ApiProperty({
    example: 'eyJhbGc...eyJpZCI6...ZlZWD--m...4Xew',
    description: 'JWT token for access to endpoints with bearer auth',
  })
  @IsDefined()
  @IsNotEmpty()
  public readonly accessToken: string;

  @ApiProperty({
    example: 'eyJhbGc...eyJpZCI6...ZlZWD--m...4Xew',
    description: 'JWT token for for renewal the access token.',
  })
  @IsDefined()
  @IsNotEmpty()
  @MinLength(8)
  public readonly refreshToken: string;
}
